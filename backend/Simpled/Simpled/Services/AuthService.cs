﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Simpled.Data;
using Simpled.Dtos.Auth;
using Simpled.Models;
using Simpled.Repository;

namespace Simpled.Services
{
    public class AuthService : IAuthRepository
    {
        private readonly SimpledDbContext _context;
        private readonly AchievementsService _achievementsService;
        private readonly IConfiguration _configuration;

        public AuthService(
            SimpledDbContext context,
            AchievementsService achievementsService,
            IConfiguration configuration)
        {
            _context = context;
            _achievementsService = achievementsService;
            _configuration = configuration;
        }

        public async Task<LoginResultDto?> LoginAsync(LoginRequestDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return null;


            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, string.Join(",", user.Roles.Select(r => r.Role)))
            };


            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);


            user.CreatedBoardsCount = 10;
            user.CreatedTasksCount = 50;
            user.CompletedTasksCount = 5;
            user.TeamsCount = 3;
            await _context.SaveChangesAsync();

            var unlocked = new List<string>();
            unlocked.AddRange(await _achievementsService.ProcessActionAsync(user, "CrearTablero", user.CreatedBoardsCount));
            unlocked.AddRange(await _achievementsService.ProcessActionAsync(user, "CrearTarea", user.CreatedTasksCount));
            unlocked.AddRange(await _achievementsService.ProcessActionAsync(user, "CompletarTarea", user.CompletedTasksCount));
            unlocked.AddRange(await _achievementsService.ProcessActionAsync(user, "UnirseEquipo", user.TeamsCount));
            foreach (var logro in unlocked)
                Console.WriteLine($"Logro desbloqueado al logear: {logro}");

            return new LoginResultDto
            {
                Token = tokenString,
                UserId = user.Id.ToString()
            };
        }

        public async Task<LoginResultDto?> ExternalLoginAsync(ExternalLoginDto dto)
        {

            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);


            if (user == null)
            {
                user = new User
                {
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    Roles = new List<UserRole> { new UserRole { Role = "User" } }
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }


            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, string.Join(",", user.Roles.Select(r => r.Role)))
            };


            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new LoginResultDto
            {
                Token = tokenString,
                UserId = user.Id.ToString()
            };
        }
    }
}

using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Simpled.Data;
using Simpled.Dtos.Auth;
using Simpled.Models;
using Simpled.Repository;
using Simpled.Models.Enums;

namespace Simpled.Services
{
    /// <summary>
    /// Servicio para la autenticación y login de usuarios.
    /// Implementa IAuthRepository.
    /// </summary>
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

        /// <summary>
        /// Realiza el login de un usuario con email y contraseña.
        /// </summary>
        /// <param name="loginDto">Datos de login.</param>
        /// <returns>DTO con el token y el ID del usuario, o null si las credenciales son inválidas.</returns>
        public async Task<LoginResultDto?> LoginAsync(LoginRequestDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return null;
            if (user.IsBanned)
                return new LoginResultDto
                {
                    IsBanned = true,
                    UserId = user.Id.ToString(),
                    Token = string.Empty
                };

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.WebRole.ToString())
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
                UserId = user.Id.ToString(),
                IsBanned = false
            };
        }

        /// <summary>
        /// Realiza el login externo (por ejemplo, Google).
        /// </summary>
        /// <param name="dto">Datos del login externo.</param>
        /// <returns>DTO con el token y el ID del usuario.</returns>
        public async Task<LoginResultDto?> ExternalLoginAsync(ExternalLoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user != null && user.IsBanned)
                return new LoginResultDto
                {
                    IsBanned = true,
                    UserId = user.Id.ToString(),
                    Token = string.Empty
                };

            if (user == null)
            {
                user = new User
                {
                    Email = dto.Email,
                    Name = string.IsNullOrEmpty(dto.Name) ? "" : dto.Name,
                    ImageUrl = string.IsNullOrEmpty(dto.ImageUrl) ? "/images/default/avatar-default.jpg" : dto.ImageUrl,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    Roles = new List<UserRole> { new UserRole { Role = "User" } },
                    IsExternal = true,
                    Provider = dto.Provider
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Actualizar nombre e imagen si han cambiado y los datos 
                bool updated = false;
                if (!string.IsNullOrEmpty(dto.Name) && user.Name != dto.Name)
                {
                    user.Name = dto.Name;
                    updated = true;
                }
                if (!string.IsNullOrEmpty(dto.ImageUrl) && user.ImageUrl != dto.ImageUrl)
                {
                    user.ImageUrl = dto.ImageUrl;
                    updated = true;
                }
                if (updated)
                {
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                }
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
                UserId = user.Id.ToString(),
                IsBanned = false
            };
        }
    }
}

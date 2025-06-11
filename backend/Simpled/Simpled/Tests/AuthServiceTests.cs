using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Simpled.Data;
using Simpled.Dtos.Auth;
using Simpled.Models;
using Simpled.Services;
using Xunit;

namespace Simpled.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly AchievementsService _achievementsService;
        private readonly SimpledDbContext _context;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            // Mock de IConfiguration
            _mockConfiguration = new Mock<IConfiguration>();
            var jwtSection = new Mock<IConfigurationSection>();
            jwtSection.Setup(x => x["Key"]).Returns("TuClaveSecretaSuperSegura123!@#TuClaveSecretaSuperSegura123!@#");
            jwtSection.Setup(x => x["Issuer"]).Returns("TestIssuer");
            jwtSection.Setup(x => x["Audience"]).Returns("TestAudience");
            _mockConfiguration.Setup(x => x.GetSection("JwtSettings")).Returns(jwtSection.Object);

            // BBDD en memoria
            var options = new DbContextOptionsBuilder<SimpledDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new SimpledDbContext(options);

            _achievementsService = new AchievementsService(_context);

            _authService = new AuthService(_context, _achievementsService, _mockConfiguration.Object);
        }

        [Fact]
        public async Task LoginAsync_ConCredencialesValidas_DevuelveResultadoLogin()
        {
            var password = "TestPassword123";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User
            {
                Email = "test@example.com",
                PasswordHash = hashedPassword,
                IsBanned = false,
                Roles = new List<UserRole> { new UserRole { Role = "User" } }
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginRequestDto
            {
                Email = "test@example.com",
                Password = password
            };

            var result = await _authService.LoginAsync(loginDto);

            // Asserts
            Assert.NotNull(result);
            Assert.False(result.IsBanned);
            Assert.Equal(user.Id.ToString(), result.UserId);
            Assert.NotNull(result.Token);
        }

        [Fact]
        public async Task LoginAsync_ConCredencialesInvalidas_DevuelveNull()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "nonexistent@example.com",
                Password = "WrongPassword123"
            };

            var result = await _authService.LoginAsync(loginDto);

            // Asserts
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_ConUsuarioBaneado_DevuelveResultadoBaneado()
        {
            var password = "TestPassword123";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User
            {
                Email = "banned@example.com",
                PasswordHash = hashedPassword,
                IsBanned = true,
                Roles = new List<UserRole> { new UserRole { Role = "User" } }
            };
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginRequestDto
            {
                Email = "banned@example.com",
                Password = password
            };
  
            var result = await _authService.LoginAsync(loginDto);

            // Asserts
            Assert.NotNull(result);
            Assert.True(result.IsBanned);
            Assert.Equal(user.Id.ToString(), result.UserId);
            Assert.Equal(string.Empty, result.Token);
        }
    }
} 
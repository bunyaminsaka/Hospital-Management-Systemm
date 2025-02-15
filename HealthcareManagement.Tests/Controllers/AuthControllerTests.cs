using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using HealthcareManagement.API.Controllers;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.API.Services;
using HealthcareManagement.Tests.Helpers;
using HealthcareManagement.API.DTOs;
using Xunit;
using Moq;

namespace HealthcareManagement.Tests.Controllers
{
    public class AuthControllerTests : IDisposable
    {
        private readonly HealthcareDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly Mock<JwtService> _jwtServiceMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _context = TestDatabaseHelper.CreateTestDatabase();
            _passwordService = new PasswordService();
            
            _configurationMock = new Mock<IConfiguration>();
            _configurationMock.Setup(x => x["JwtSettings:Key"]).Returns("your-test-secret-key-here-make-it-long-enough");
            _configurationMock.Setup(x => x["JwtSettings:Issuer"]).Returns("test-issuer");
            _configurationMock.Setup(x => x["JwtSettings:Audience"]).Returns("test-audience");

            _jwtServiceMock = new Mock<JwtService>(_configurationMock.Object);
            _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
                .Returns("test-token");

            _controller = new AuthController(
                _context, 
                _configurationMock.Object, 
                _passwordService,
                _jwtServiceMock.Object
            );
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsToken()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                PasswordHash = _passwordService.HashPassword("Test123!"),
                Role = "User"
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginRequest = new LoginRequest
            {
                Username = "testuser",
                Password = "Test123!"
            };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AuthResponse>(okResult.Value);
            Assert.NotNull(response.Token);
            Assert.Equal(user.Role, response.Role);
        }

        [Fact]
        public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Username = "testuser",
                Password = "WrongPassword"
            };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result.Result);
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Username = "newuser",
                Password = "Test123!",
                Role = "User"
            };

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<AuthResponse>(okResult.Value);
            Assert.NotNull(response.Token);
            Assert.Equal(registerRequest.Role, response.Role);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
} 
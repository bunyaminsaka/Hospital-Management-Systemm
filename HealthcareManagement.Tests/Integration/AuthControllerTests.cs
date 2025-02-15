using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using HealthcareManagement.API;
using HealthcareManagement.API.DTOs;

namespace HealthcareManagement.Tests.Integration
{
    public class AuthControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public AuthControllerTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        [Fact]
        public async Task Login_ReturnsToken_WhenValidCredentials()
        {
            // Arrange
            var loginData = new LoginDto
            {
                Username = "admin",
                Password = "Admin123!"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(loginData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var loginResponse = JsonConvert.DeserializeObject<LoginResponseDto>(responseContent);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(loginResponse);
            Assert.NotNull(loginResponse.Token);
            Assert.Equal("Admin", loginResponse.Role);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenInvalidCredentials()
        {
            // Arrange
            var loginData = new LoginDto
            {
                Username = "admin",
                Password = "WrongPassword"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(loginData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", content);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Register_CreatesNewUser_WhenValidData()
        {
            // Arrange
            var registerData = new RegisterDto
            {
                Username = "newuser",
                Password = "NewUser123!",
                Role = "Doctor"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(registerData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var userResponse = JsonConvert.DeserializeObject<UserDto>(responseContent);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(userResponse);
            Assert.Equal(registerData.Username, userResponse.Username);
            Assert.Equal(registerData.Role, userResponse.Role);

            // Verify can login with new credentials
            var loginData = new LoginDto
            {
                Username = registerData.Username,
                Password = registerData.Password
            };

            var loginContent = new StringContent(
                JsonConvert.SerializeObject(loginData),
                Encoding.UTF8,
                "application/json");

            var loginResponse = await _client.PostAsync("/api/auth/login", loginContent);
            Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenUsernameExists()
        {
            // Arrange
            var registerData = new RegisterDto
            {
                Username = "admin", // Existing username from test data
                Password = "Password123!",
                Role = "Doctor"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(registerData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenInvalidRole()
        {
            // Arrange
            var registerData = new RegisterDto
            {
                Username = "newuser",
                Password = "Password123!",
                Role = "InvalidRole"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(registerData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenPasswordTooWeak()
        {
            // Arrange
            var registerData = new RegisterDto
            {
                Username = "newuser",
                Password = "weak",
                Role = "Doctor"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(registerData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/register", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
} 
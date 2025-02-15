using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using HealthcareManagement.API;
using HealthcareManagement.API.DTOs;
using HealthcareManagement.API.Models;

namespace HealthcareManagement.Tests.Integration
{
    public class DoctorsControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public DoctorsControllerTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        private async Task AuthenticateAsync()
        {
            var loginRequest = new LoginRequest
            {
                Username = "testadmin",
                Password = "Test123!"
            };

            var jsonContent = JsonSerializer.Serialize(loginRequest, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            
            var response = await _client.PostAsync("/api/auth/login", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var loginResult = JsonSerializer.Deserialize<AuthResponse>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            Assert.NotNull(loginResult?.Token);
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", loginResult.Token);
        }

        [Fact]
        public async Task GetDoctors_ReturnsUnauthorized_WhenNotAuthenticated()
        {
            var response = await _client.GetAsync("/api/doctors");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetDoctors_ReturnsAllDoctors_WhenAuthenticated()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/doctors");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var doctors = JsonSerializer.Deserialize<List<DoctorDto>>(content, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.NotNull(doctors);
            Assert.NotEmpty(doctors);
        }

        [Fact]
        public async Task GetDoctor_ReturnsDoctor_WhenExists()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/doctors/1");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var doctor = JsonSerializer.Deserialize<DoctorDto>(content);

            // Assert
            Assert.NotNull(doctor);
            Assert.NotNull(doctor.Name);
            Assert.Equal("Test Doctor 1", doctor.Name);
        }

        [Fact]
        public async Task CreateDoctor_CreatesNewDoctor_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var newDoctor = new CreateDoctorDto
            {
                Name = "Dr. New",
                Specialty = "Neurology",
                PhoneNumber = "123-456-7899",
                Email = "dr.new@test.com"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(newDoctor, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }),
                Encoding.UTF8,
                MediaTypeHeaderValue.Parse("application/json").ToString());

            // Act
            var response = await _client.PostAsync("/api/doctors", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdDoctor = JsonSerializer.Deserialize<DoctorDto>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(createdDoctor);
            Assert.Equal(newDoctor.Name, createdDoctor.Name);
            Assert.Equal(newDoctor.Specialty, createdDoctor.Specialty);
        }

        [Fact]
        public async Task UpdateDoctor_UpdatesExistingDoctor_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var updateData = new UpdateDoctorDto
            {
                Name = "Dr. Updated",
                Specialty = "Updated Specialty",
                PhoneNumber = "123-456-7890",
                Email = "updated@test.com"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(updateData, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }),
                Encoding.UTF8,
                MediaTypeHeaderValue.Parse("application/json").ToString());

            // Act
            var response = await _client.PutAsync("/api/doctors/1", content);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the update
            var getResponse = await _client.GetAsync("/api/doctors/1");
            var getContent = await getResponse.Content.ReadAsStringAsync();
            var updatedDoctor = JsonSerializer.Deserialize<DoctorDto>(getContent);

            Assert.NotNull(updatedDoctor);
            Assert.Equal(updateData.Name, updatedDoctor.Name);
            Assert.Equal(updateData.Specialty, updatedDoctor.Specialty);
        }

        [Fact]
        public async Task DeleteDoctor_DeletesExistingDoctor()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.DeleteAsync("/api/doctors/2");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the deletion
            var getResponse = await _client.GetAsync("/api/doctors/2");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }
    }
} 
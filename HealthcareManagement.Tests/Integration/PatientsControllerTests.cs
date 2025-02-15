using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using HealthcareManagement.API;
using HealthcareManagement.API.DTOs;
using HealthcareManagement.API.Models;

namespace HealthcareManagement.Tests.Integration
{
    public class PatientsControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public PatientsControllerTests(TestWebApplicationFactory<Program> factory)
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

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
            var loginResult = await response.Content.ReadFromJsonAsync<AuthResponse>();
            Assert.NotNull(loginResult?.Token);

            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", loginResult.Token);
        }

        [Fact]
        public async Task GetPatients_ReturnsUnauthorized_WhenNotAuthenticated()
        {
            var response = await _client.GetAsync("/api/patients");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetPatients_ReturnsAllPatients_WhenAuthenticated()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/patients");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var patients = JsonConvert.DeserializeObject<List<PatientDto>>(content);

            // Assert
            Assert.NotNull(patients);
            Assert.NotEmpty(patients);
        }

        [Fact]
        public async Task GetPatient_ReturnsPatient_WhenExists()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/patients/1");
            var content = await response.Content.ReadAsStringAsync();
            var patient = JsonConvert.DeserializeObject<PatientDto>(content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(patient);
            Assert.Equal("Test Patient 1", patient.Name);
        }

        [Fact]
        public async Task CreatePatient_CreatesNewPatient_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var newPatient = new CreatePatientDto
            {
                Name = "New Patient",
                DateOfBirth = DateTime.Now.AddYears(-25),
                Gender = "Female",
                PhoneNumber = "123-456-7899",
                Email = "newpatient@test.com"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(newPatient),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/patients", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdPatient = JsonConvert.DeserializeObject<PatientDto>(responseContent);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(createdPatient);
            Assert.Equal(newPatient.Name, createdPatient.Name);
            Assert.Equal(newPatient.Gender, createdPatient.Gender);
        }

        [Fact]
        public async Task UpdatePatient_UpdatesExistingPatient_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var updateData = new CreatePatientDto
            {
                Name = "Updated Patient",
                DateOfBirth = DateTime.Now.AddYears(-30),
                Gender = "Male",
                PhoneNumber = "123-456-7890",
                Email = "updated@test.com"
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(updateData),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PutAsync("/api/patients/1", content);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the update
            var getResponse = await _client.GetAsync("/api/patients/1");
            var getContent = await getResponse.Content.ReadAsStringAsync();
            var updatedPatient = JsonConvert.DeserializeObject<PatientDto>(getContent);

            Assert.Equal(updateData.Name, updatedPatient.Name);
            Assert.Equal(updateData.Gender, updatedPatient.Gender);
        }

        [Fact]
        public async Task DeletePatient_DeletesExistingPatient()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.DeleteAsync("/api/patients/2");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the deletion
            var getResponse = await _client.GetAsync("/api/patients/2");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task GetPatientsByGender_ReturnsFilteredPatients()
        {
            // Arrange
            await AuthenticateAsync();
            var gender = "Male";

            // Act
            var response = await _client.GetAsync($"/api/patients/gender/{gender}");
            var content = await response.Content.ReadAsStringAsync();
            var patients = JsonConvert.DeserializeObject<List<PatientDto>>(content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotEmpty(patients);
            Assert.All(patients, patient => Assert.Equal(gender, patient.Gender));
        }

        [Fact]
        public async Task SearchPatients_ReturnsMatchingPatients()
        {
            // Arrange
            await AuthenticateAsync();
            var searchTerm = "Test Patient 1";

            // Act
            var response = await _client.GetAsync($"/api/patients/search/{searchTerm}");
            var content = await response.Content.ReadAsStringAsync();
            var patients = JsonConvert.DeserializeObject<List<PatientDto>>(content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotEmpty(patients);
            Assert.Contains(patients, patient => patient.Name.Contains(searchTerm));
        }
    }
} 
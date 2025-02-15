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
    public class MedicalRecordsControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public MedicalRecordsControllerTests(TestWebApplicationFactory<Program> factory)
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
        public async Task GetMedicalRecords_ReturnsUnauthorized_WhenNotAuthenticated()
        {
            var response = await _client.GetAsync("/api/medical-records");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetMedicalRecords_ReturnsAllRecords_WhenAuthenticated()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/medical-records");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var records = JsonSerializer.Deserialize<List<MedicalRecordDto>>(content, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.NotNull(records);
            Assert.NotEmpty(records);
            Assert.All(records, record => 
            {
                Assert.NotNull(record);
                Assert.NotEqual(0, record.Id);
            });
        }

        [Fact]
        public async Task GetMedicalRecord_ReturnsRecord_WhenExists()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/medical-records/1");
            var content = await response.Content.ReadAsStringAsync();
            var record = JsonSerializer.Deserialize<MedicalRecordDto>(content, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(record);
            Assert.Equal(1, record.PatientId);
            Assert.NotNull(record.Diagnosis);
        }

        [Fact]
        public async Task CreateMedicalRecord_CreatesNewRecord_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var newRecord = new CreateMedicalRecordDto
            {
                PatientId = 1,
                Diagnosis = "Common Cold",
                Treatment = "Rest and fluids",
                Notes = "Patient showing improvement"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(newRecord, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PostAsync("/api/medical-records", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdRecord = JsonSerializer.Deserialize<MedicalRecordDto>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(createdRecord);
            Assert.Equal(newRecord.PatientId, createdRecord.PatientId);
            Assert.Equal(newRecord.Diagnosis, createdRecord.Diagnosis);
            Assert.Equal(newRecord.Treatment, createdRecord.Treatment);
        }

        [Fact]
        public async Task UpdateMedicalRecord_UpdatesExistingRecord_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var updateData = new UpdateMedicalRecordDto
            {
                Diagnosis = "Updated Diagnosis",
                Treatment = "Updated Treatment",
                Notes = "Updated notes"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(updateData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PutAsync("/api/medical-records/1", content);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the update
            var getResponse = await _client.GetAsync("/api/medical-records/1");
            var getContent = await getResponse.Content.ReadAsStringAsync();
            var updatedRecord = JsonSerializer.Deserialize<MedicalRecordDto>(getContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            Assert.Equal(updateData.Diagnosis, updatedRecord.Diagnosis);
            Assert.Equal(updateData.Treatment, updatedRecord.Treatment);
            Assert.Equal(updateData.Notes, updatedRecord.Notes);
        }

        [Fact]
        public async Task DeleteMedicalRecord_DeletesExistingRecord()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.DeleteAsync("/api/medical-records/2");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the deletion
            var getResponse = await _client.GetAsync("/api/medical-records/2");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task GetMedicalRecordsByPatient_ReturnsFilteredRecords()
        {
            // Arrange
            await AuthenticateAsync();
            var patientId = 1;

            // Act
            var response = await _client.GetAsync($"/api/medical-records/patient/{patientId}");
            var content = await response.Content.ReadAsStringAsync();
            var records = JsonSerializer.Deserialize<List<MedicalRecordDto>>(content, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(records);
            Assert.NotEmpty(records);
            Assert.All(records, record => 
            {
                Assert.NotNull(record);
                Assert.Equal(patientId, record.PatientId);
            });
        }

        [Fact]
        public async Task SearchMedicalRecords_ReturnsMatchingRecords()
        {
            // Arrange
            await AuthenticateAsync();
            var searchTerm = "Cold";

            // Act
            var response = await _client.GetAsync($"/api/medical-records/search/{searchTerm}");
            var content = await response.Content.ReadAsStringAsync();
            var records = JsonSerializer.Deserialize<List<MedicalRecordDto>>(content, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotEmpty(records);
            Assert.Contains(records, r => 
                r.Diagnosis.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                r.Treatment.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                r.Notes.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }
    }
} 
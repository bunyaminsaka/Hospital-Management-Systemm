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
    public class AppointmentsControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public AppointmentsControllerTests(TestWebApplicationFactory<Program> factory)
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
        public async Task GetAppointments_ReturnsUnauthorized_WhenNotAuthenticated()
        {
            var response = await _client.GetAsync("/api/appointments");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetAppointments_ReturnsAllAppointments_WhenAuthenticated()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/appointments");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var appointments = JsonSerializer.Deserialize<List<AppointmentDto>>(content);

            // Assert
            Assert.NotNull(appointments);
            Assert.NotEmpty(appointments);
        }

        [Fact]
        public async Task GetAppointment_ReturnsAppointment_WhenExists()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.GetAsync("/api/appointments/1");
            var content = await response.Content.ReadAsStringAsync();
            var appointment = JsonSerializer.Deserialize<AppointmentDto>(content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(appointment);
            Assert.Equal(1, appointment.DoctorId);
            Assert.Equal(1, appointment.PatientId);
        }

        [Fact]
        public async Task CreateAppointment_CreatesNewAppointment_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var newAppointment = new CreateAppointmentDto
            {
                DoctorId = 1,
                PatientId = 1,
                AppointmentDate = DateTime.Now.AddDays(1),
                Notes = "Regular checkup"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(newAppointment, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }),
                Encoding.UTF8,
                MediaTypeHeaderValue.Parse("application/json").ToString());

            // Act
            var response = await _client.PostAsync("/api/appointments", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdAppointment = JsonSerializer.Deserialize<AppointmentDto>(responseContent);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(createdAppointment);
            Assert.Equal(newAppointment.DoctorId, createdAppointment.DoctorId);
            Assert.Equal(newAppointment.PatientId, createdAppointment.PatientId);
            Assert.Equal("Scheduled", createdAppointment.Status);
        }

        [Fact]
        public async Task UpdateAppointment_UpdatesExistingAppointment_WhenValidData()
        {
            // Arrange
            await AuthenticateAsync();
            var updateData = new UpdateAppointmentDto
            {
                AppointmentDate = DateTime.Now.AddDays(2),
                Status = "Rescheduled",
                Notes = "Rescheduled appointment"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(updateData, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }),
                Encoding.UTF8,
                "application/json");

            // Act
            var response = await _client.PutAsync("/api/appointments/1", content);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the update
            var getResponse = await _client.GetAsync("/api/appointments/1");
            var getContent = await getResponse.Content.ReadAsStringAsync();
            var updatedAppointment = JsonSerializer.Deserialize<AppointmentDto>(getContent);

            Assert.Equal(updateData.Status, updatedAppointment.Status);
            Assert.Equal(updateData.Notes, updatedAppointment.Notes);
        }

        [Fact]
        public async Task DeleteAppointment_DeletesExistingAppointment()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            var response = await _client.DeleteAsync("/api/appointments/2");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the deletion
            var getResponse = await _client.GetAsync("/api/appointments/2");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task GetAppointmentsByDoctor_ReturnsFilteredAppointments()
        {
            // Arrange
            await AuthenticateAsync();
            var doctorId = 1;

            // Act
            var response = await _client.GetAsync($"/api/appointments/doctor/{doctorId}");
            var content = await response.Content.ReadAsStringAsync();
            var appointments = JsonSerializer.Deserialize<List<AppointmentDto>>(content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotEmpty(appointments);
            Assert.All(appointments, appointment => Assert.Equal(doctorId, appointment.DoctorId));
        }

        [Fact]
        public async Task GetAppointmentsByPatient_ReturnsFilteredAppointments()
        {
            // Arrange
            await AuthenticateAsync();
            var patientId = 1;

            // Act
            var response = await _client.GetAsync($"/api/appointments/patient/{patientId}");
            var content = await response.Content.ReadAsStringAsync();
            var appointments = JsonSerializer.Deserialize<List<AppointmentDto>>(content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotEmpty(appointments);
            Assert.All(appointments, appointment => Assert.Equal(patientId, appointment.PatientId));
        }
    }
} 
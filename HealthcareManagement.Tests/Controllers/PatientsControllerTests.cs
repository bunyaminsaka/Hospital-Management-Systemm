using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Controllers;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.Tests.Helpers;
using HealthcareManagement.API.DTOs;

namespace HealthcareManagement.Tests.Controllers
{
    public class PatientsControllerTests : IDisposable
    {
        private readonly HealthcareDbContext _context;
        private readonly PatientsController _controller;

        public PatientsControllerTests()
        {
            _context = TestDatabaseHelper.CreateTestDatabase();
            _controller = new PatientsController(_context);
        }

        [Fact]
        public async Task GetPatients_ReturnsAllPatients()
        {
            // Act
            var result = await _controller.GetPatients();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var patients = Assert.IsAssignableFrom<IEnumerable<PatientDto>>(okResult.Value);
            Assert.Equal(2, patients.Count());
        }

        [Fact]
        public async Task GetPatient_WithValidId_ReturnsPatient()
        {
            // Arrange
            var existingPatient = await _context.Patients.FirstAsync();

            // Act
            var result = await _controller.GetPatient(existingPatient.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var patient = Assert.IsType<PatientDto>(okResult.Value);
            Assert.Equal(existingPatient.Name, patient.Name);
        }

        [Fact]
        public async Task GetPatient_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetPatient(-1);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreatePatient_WithValidData_ReturnsCreatedPatient()
        {
            // Arrange
            var newPatient = new CreatePatientDto
            {
                Name = "New Test Patient",
                DateOfBirth = DateTime.Now.AddYears(-20),
                Gender = "Female",
                PhoneNumber = "123-456-7895",
                Email = "newpatient@test.com"
            };

            // Act
            var result = await _controller.CreatePatient(newPatient);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var patient = Assert.IsType<PatientDto>(createdResult.Value);
            Assert.Equal(newPatient.Name, patient.Name);
            Assert.Equal(newPatient.Gender, patient.Gender);
        }

        [Fact]
        public async Task UpdatePatient_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var existingPatient = await _context.Patients.FirstOrDefaultAsync();
            Assert.NotNull(existingPatient);

            var updateData = new UpdatePatientDto
            {
                Name = "Updated Name",
                DateOfBirth = DateTime.Now.AddYears(-25),
                Gender = "Female",
                PhoneNumber = existingPatient.PhoneNumber ?? "123-456-7890",
                Email = existingPatient.Email ?? "test@example.com"
            };

            // Act
            var result = await _controller.UpdatePatient(existingPatient.Id, updateData);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updatedPatient = await _context.Patients.FindAsync(existingPatient.Id);
            Assert.NotNull(updatedPatient);
            Assert.Equal(updateData.Name, updatedPatient.Name);
        }

        [Fact]
        public async Task DeletePatient_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var existingPatient = await _context.Patients.FirstAsync();

            // Act
            var result = await _controller.DeletePatient(existingPatient.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the deletion
            var deletedPatient = await _context.Patients.FindAsync(existingPatient.Id);
            Assert.Null(deletedPatient);
        }

        [Fact]
        public async Task GetPatientsByGender_ReturnsFilteredPatients()
        {
            // Arrange
            var gender = "Female";

            // Act
            var result = await _controller.GetPatientsByGender(gender);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var patients = Assert.IsAssignableFrom<IEnumerable<PatientDto>>(okResult.Value);
            Assert.All(patients, patient => Assert.Equal(gender, patient.Gender));
        }

        [Fact]
        public async Task SearchPatients_ReturnsMatchingPatients()
        {
            // Arrange
            var searchTerm = "Test Patient 1";

            // Act
            var result = await _controller.SearchPatients(searchTerm);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var patients = Assert.IsAssignableFrom<IEnumerable<PatientDto>>(okResult.Value);
            Assert.All(patients, patient => Assert.Contains(searchTerm, patient.Name));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
} 
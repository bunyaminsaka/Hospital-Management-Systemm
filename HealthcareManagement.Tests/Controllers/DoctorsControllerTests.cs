using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Controllers;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.Tests.Helpers;
using HealthcareManagement.API.DTOs;

namespace HealthcareManagement.Tests.Controllers
{
    public class DoctorsControllerTests : IDisposable
    {
        private readonly HealthcareDbContext _context;
        private readonly DoctorsController _controller;

        public DoctorsControllerTests()
        {
            _context = TestDatabaseHelper.CreateTestDatabase();
            _controller = new DoctorsController(_context);
        }

        [Fact]
        public async Task GetDoctors_ReturnsAllDoctors()
        {
            // Act
            var result = await _controller.GetDoctors();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var doctors = Assert.IsAssignableFrom<IEnumerable<DoctorDto>>(okResult.Value);
            Assert.NotNull(doctors);
            Assert.NotEmpty(doctors);
        }

        [Fact]
        public async Task GetDoctor_WithValidId_ReturnsDoctor()
        {
            // Arrange
            var existingDoctor = await _context.Doctors.FirstAsync();

            // Act
            var result = await _controller.GetDoctor(existingDoctor.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var doctor = Assert.IsType<DoctorDto>(okResult.Value);
            Assert.Equal(existingDoctor.Name, doctor.Name);
        }

        [Fact]
        public async Task GetDoctor_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetDoctor(-1);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateDoctor_WithValidData_ReturnsCreatedDoctor()
        {
            // Arrange
            var newDoctor = new CreateDoctorDto
            {
                Name = "New Test Doctor",
                Specialty = "Test Specialty",
                PhoneNumber = "123-456-7894",
                Email = "newdoctor@test.com"
            };

            // Act
            var result = await _controller.CreateDoctor(newDoctor);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var doctor = Assert.IsType<DoctorDto>(createdResult.Value);
            Assert.Equal(newDoctor.Name, doctor.Name);
            Assert.Equal(newDoctor.Specialty, doctor.Specialty);
        }

        [Fact]
        public async Task UpdateDoctor_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var existingDoctor = await _context.Doctors.FirstOrDefaultAsync();
            Assert.NotNull(existingDoctor);

            var updateData = new UpdateDoctorDto
            {
                Name = "Updated Name",
                Specialty = "Updated Specialty",
                PhoneNumber = "123-456-7890",
                Email = "updated@example.com"
            };

            // Act
            var result = await _controller.UpdateDoctor(existingDoctor.Id, updateData);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updatedDoctor = await _context.Doctors.FindAsync(existingDoctor.Id);
            Assert.NotNull(updatedDoctor);
            Assert.Equal(updateData.Name, updatedDoctor.Name);
        }

        [Fact]
        public async Task DeleteDoctor_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var existingDoctor = await _context.Doctors.FirstAsync();

            // Act
            var result = await _controller.DeleteDoctor(existingDoctor.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the deletion
            var deletedDoctor = await _context.Doctors.FindAsync(existingDoctor.Id);
            Assert.Null(deletedDoctor);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
} 
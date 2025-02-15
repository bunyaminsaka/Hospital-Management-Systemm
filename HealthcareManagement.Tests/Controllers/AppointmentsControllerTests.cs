using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Controllers;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.Tests.Helpers;
using HealthcareManagement.API.DTOs;
using Xunit;
using Moq;

namespace HealthcareManagement.Tests.Controllers
{
    public class AppointmentsControllerTests : IDisposable
    {
        private readonly HealthcareDbContext _context;
        private readonly AppointmentsController _controller;

        public AppointmentsControllerTests()
        {
            var options = new DbContextOptionsBuilder<HealthcareDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;
            _context = new HealthcareDbContext(options);
            _controller = new AppointmentsController(_context);
        }

        [Fact]
        public async Task GetAppointments_ReturnsAllAppointments()
        {
            // Act
            var result = await _controller.GetAppointments();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var appointments = Assert.IsAssignableFrom<IEnumerable<AppointmentDto>>(okResult.Value);
            Assert.Equal(2, appointments.Count());
        }

        [Fact]
        public async Task GetAppointment_WithValidId_ReturnsAppointment()
        {
            // Arrange
            var existingAppointment = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .FirstAsync();

            // Act
            var result = await _controller.GetAppointment(existingAppointment.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var appointment = Assert.IsType<AppointmentDto>(okResult.Value);
            Assert.Equal(existingAppointment.DoctorId, appointment.DoctorId);
            Assert.Equal(existingAppointment.PatientId, appointment.PatientId);
        }

        [Fact]
        public async Task GetAppointment_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetAppointment(-1);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateAppointment_WithValidData_ReturnsCreatedAppointment()
        {
            // Arrange
            var doctor = await _context.Doctors.FirstAsync();
            var patient = await _context.Patients.FirstAsync();
            var newAppointment = new CreateAppointmentDto
            {
                DoctorId = doctor.Id,
                PatientId = patient.Id,
                AppointmentDate = DateTime.Now.AddDays(7),
                Notes = "Test appointment"
            };

            // Act
            var result = await _controller.CreateAppointment(newAppointment);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var appointment = Assert.IsType<AppointmentDto>(createdResult.Value);
            Assert.Equal(newAppointment.DoctorId, appointment.DoctorId);
            Assert.Equal(newAppointment.PatientId, appointment.PatientId);
            Assert.Equal("Scheduled", appointment.Status);
        }

        [Fact]
        public async Task CreateAppointment_WithInvalidDoctorId_ReturnsBadRequest()
        {
            // Arrange
            var patient = await _context.Patients.FirstAsync();
            var newAppointment = new CreateAppointmentDto
            {
                DoctorId = -1,
                PatientId = patient.Id,
                AppointmentDate = DateTime.Now.AddDays(7),
                Notes = "Test appointment"
            };

            // Act
            var result = await _controller.CreateAppointment(newAppointment);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateAppointment_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var existingAppointment = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .FirstOrDefaultAsync();
            Assert.NotNull(existingAppointment);
            Assert.NotNull(existingAppointment.Doctor);
            Assert.NotNull(existingAppointment.Patient);

            var updateData = new UpdateAppointmentDto
            {
                AppointmentDate = DateTime.Now.AddDays(7),
                Status = "Rescheduled",
                Notes = "Updated notes"
            };

            // Act
            var result = await _controller.UpdateAppointment(existingAppointment.Id, updateData);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updatedAppointment = await _context.Appointments.FindAsync(existingAppointment.Id);
            Assert.NotNull(updatedAppointment);
            Assert.Equal(updateData.Status, updatedAppointment.Status);
        }

        [Fact]
        public async Task DeleteAppointment_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var existingAppointment = await _context.Appointments.FirstAsync();

            // Act
            var result = await _controller.DeleteAppointment(existingAppointment.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the deletion
            var deletedAppointment = await _context.Appointments.FindAsync(existingAppointment.Id);
            Assert.Null(deletedAppointment);
        }

        [Fact]
        public async Task GetDoctorAppointments_ReturnsFilteredAppointments()
        {
            // Arrange
            var doctor = await _context.Doctors.FirstAsync();

            // Act
            var result = await _controller.GetDoctorAppointments(doctor.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var appointments = Assert.IsAssignableFrom<IEnumerable<AppointmentDto>>(okResult.Value);
            Assert.All(appointments, appointment => Assert.Equal(doctor.Id, appointment.DoctorId));
        }

        [Fact]
        public async Task GetPatientAppointments_ReturnsFilteredAppointments()
        {
            // Arrange
            var patient = await _context.Patients.FirstAsync();

            // Act
            var result = await _controller.GetPatientAppointments(patient.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var appointments = Assert.IsAssignableFrom<IEnumerable<AppointmentDto>>(okResult.Value);
            Assert.All(appointments, appointment => Assert.Equal(patient.Id, appointment.PatientId));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
} 
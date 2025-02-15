using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Controllers;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.Tests.Helpers;
using HealthcareManagement.API.DTOs;

namespace HealthcareManagement.Tests.Controllers
{
    public class MedicalRecordsControllerTests : IDisposable
    {
        private readonly HealthcareDbContext _context;
        private readonly MedicalRecordsController _controller;

        public MedicalRecordsControllerTests()
        {
            _context = TestDatabaseHelper.CreateTestDatabase();
            _controller = new MedicalRecordsController(_context);
        }

        [Fact]
        public async Task GetMedicalRecords_ReturnsAllRecords()
        {
            // Act
            var result = await _controller.GetMedicalRecords();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var records = Assert.IsAssignableFrom<IEnumerable<MedicalRecordDto>>(okResult.Value);
            Assert.Equal(2, records.Count());
        }

        [Fact]
        public async Task GetMedicalRecord_WithValidId_ReturnsMedicalRecord()
        {
            // Arrange
            var existingRecord = await _context.MedicalRecords
                .Include(r => r.Patient)
                .FirstOrDefaultAsync();
            Assert.NotNull(existingRecord);
            Assert.NotNull(existingRecord.Patient);

            // Act
            var result = await _controller.GetMedicalRecord(existingRecord.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var record = Assert.IsType<MedicalRecordDto>(okResult.Value);
            Assert.NotNull(record);
            Assert.Equal(existingRecord.PatientId, record.PatientId);
        }

        [Fact]
        public async Task GetMedicalRecord_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetMedicalRecord(-1);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateMedicalRecord_WithValidData_ReturnsCreatedRecord()
        {
            // Arrange
            var patient = await _context.Patients.FirstAsync();
            var newRecord = new CreateMedicalRecordDto
            {
                PatientId = patient.Id,
                Diagnosis = "Test Diagnosis",
                Treatment = "Test Treatment",
                Notes = "Test notes"
            };

            // Act
            var result = await _controller.CreateMedicalRecord(newRecord);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var record = Assert.IsType<MedicalRecordDto>(createdResult.Value);
            Assert.Equal(newRecord.PatientId, record.PatientId);
            Assert.Equal(newRecord.Diagnosis, record.Diagnosis);
            Assert.Equal(newRecord.Treatment, record.Treatment);
        }

        [Fact]
        public async Task CreateMedicalRecord_WithInvalidPatientId_ReturnsBadRequest()
        {
            // Arrange
            var newRecord = new CreateMedicalRecordDto
            {
                PatientId = -1,
                Diagnosis = "Test Diagnosis",
                Treatment = "Test Treatment",
                Notes = "Test notes"
            };

            // Act
            var result = await _controller.CreateMedicalRecord(newRecord);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateMedicalRecord_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var existingRecord = await _context.MedicalRecords.FirstAsync();
            var updateData = new UpdateMedicalRecordDto
            {
                Diagnosis = "Updated Diagnosis",
                Treatment = "Updated Treatment",
                Notes = "Updated notes"
            };

            // Act
            var result = await _controller.UpdateMedicalRecord(existingRecord.Id, updateData);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the update
            var updatedRecord = await _context.MedicalRecords.FindAsync(existingRecord.Id);
            Assert.Equal(updateData.Diagnosis, updatedRecord.Diagnosis);
            Assert.Equal(updateData.Treatment, updatedRecord.Treatment);
            Assert.Equal(updateData.Notes, updatedRecord.Notes);
        }

        [Fact]
        public async Task DeleteMedicalRecord_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var existingRecord = await _context.MedicalRecords.FirstAsync();

            // Act
            var result = await _controller.DeleteMedicalRecord(existingRecord.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);

            // Verify the deletion
            var deletedRecord = await _context.MedicalRecords.FindAsync(existingRecord.Id);
            Assert.Null(deletedRecord);
        }

        [Fact]
        public async Task GetPatientMedicalRecords_ReturnsFilteredRecords()
        {
            // Arrange
            var patient = await _context.Patients.FirstAsync();

            // Act
            var result = await _controller.GetPatientMedicalRecords(patient.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var records = Assert.IsAssignableFrom<IEnumerable<MedicalRecordDto>>(okResult.Value);
            Assert.All(records, record => Assert.Equal(patient.Id, record.PatientId));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
} 
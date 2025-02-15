using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.API.Services;

namespace HealthcareManagement.Tests.Helpers
{
    public static class TestDatabaseHelper
    {
        public static HealthcareDbContext CreateTestDatabase()
        {
            var options = new DbContextOptionsBuilder<HealthcareDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var context = new HealthcareDbContext(options);
            SeedTestData(context);
            return context;
        }

        public static void SeedTestData(HealthcareDbContext context)
        {
            // Add test admin user
            var passwordService = new PasswordService();
            var adminUser = new User
            {
                Username = "testadmin",
                PasswordHash = passwordService.HashPassword("Test123!"),
                Role = "Admin"
            };

            context.Users.Add(adminUser);
            context.SaveChanges();

            // Add test users
            context.Users.AddRange(
                new User
                {
                    Username = "testdoctor",
                    PasswordHash = passwordService.HashPassword("Test123!"),
                    Role = "Doctor"
                }
            );

            // Add test doctors
            context.Doctors.AddRange(
                new Doctor
                {
                    Name = "Test Doctor 1",
                    Specialty = "Test Specialty",
                    PhoneNumber = "123-456-7890",
                    Email = "doctor1@test.com"
                },
                new Doctor
                {
                    Name = "Test Doctor 2",
                    Specialty = "Test Specialty",
                    PhoneNumber = "123-456-7891",
                    Email = "doctor2@test.com"
                }
            );

            // Add test patients
            context.Patients.AddRange(
                new Patient
                {
                    Name = "Test Patient 1",
                    DateOfBirth = DateTime.Now.AddYears(-30),
                    Gender = "Male",
                    PhoneNumber = "123-456-7892",
                    Email = "patient1@test.com"
                },
                new Patient
                {
                    Name = "Test Patient 2",
                    DateOfBirth = DateTime.Now.AddYears(-25),
                    Gender = "Female",
                    PhoneNumber = "123-456-7893",
                    Email = "patient2@test.com"
                }
            );

            context.SaveChanges();

            // Create test appointments
            var appointments = new[]
            {
                new Appointment
                {
                    DoctorId = context.Doctors.First().Id,
                    PatientId = context.Patients.First().Id,
                    AppointmentDate = DateTime.Now.AddDays(1),
                    Status = "Scheduled",
                    Notes = "Test appointment 1"
                },
                new Appointment
                {
                    DoctorId = context.Doctors.Last().Id,
                    PatientId = context.Patients.Last().Id,
                    AppointmentDate = DateTime.Now.AddDays(2),
                    Status = "Scheduled",
                    Notes = "Test appointment 2"
                }
            };
            context.Appointments.AddRange(appointments);

            // Create test medical records
            var records = new[]
            {
                new MedicalRecord
                {
                    PatientId = context.Patients.First().Id,
                    RecordDate = DateTime.Now.AddDays(-1),
                    Diagnosis = "Test Diagnosis 1",
                    Treatment = "Test Treatment 1",
                    Notes = "Test notes 1"
                },
                new MedicalRecord
                {
                    PatientId = context.Patients.Last().Id,
                    RecordDate = DateTime.Now.AddDays(-2),
                    Diagnosis = "Test Diagnosis 2",
                    Treatment = "Test Treatment 2",
                    Notes = "Test notes 2"
                }
            };
            context.MedicalRecords.AddRange(records);

            context.SaveChanges();
        }
    }
} 
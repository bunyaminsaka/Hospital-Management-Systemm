using HealthcareManagement.API.Models;
using HealthcareManagement.API.Services;
using Microsoft.EntityFrameworkCore;

namespace HealthcareManagement.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(HealthcareDbContext context, PasswordService passwordService)
        {
            context.Database.EnsureCreated();

            // Check if there are any users
            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }

            // Add users
            var users = new List<User>
            {
                new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Role = "Admin"
                },
                new User
                {
                    Username = "doctorcapri",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                    Role = "Doctor"
                }
                // ... other users
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            // Add doctors and link them to users
            var doctors = new List<Doctor>
            {
                new Doctor
                {
                    Name = "Dr. Capri",
                    PWZNumber = "12345",
                    Specialty = "Cardiology",
                    WorkHours = "9:00-17:00",
                    PhoneNumber = "123-456-7890",
                    Email = "doctor@example.com",
                    UserId = users.First(u => u.Username == "doctorcapri").Id  // Link to user
                }
                // Add more doctors as needed
            };

            context.Doctors.AddRange(doctors);
            context.SaveChanges();

            // Create some patients
            var patients = new[]
            {
                new Patient
                {
                    Name = "Alice Brown",
                    DateOfBirth = new DateTime(1985, 5, 15),
                    Gender = "Female",
                    PhoneNumber = "123-456-7892",
                    Email = "alice.brown@email.com"
                },
                new Patient
                {
                    Name = "Bob Wilson",
                    DateOfBirth = new DateTime(1990, 8, 20),
                    Gender = "Male",
                    PhoneNumber = "123-456-7893",
                    Email = "bob.wilson@email.com"
                }
            };
            context.Patients.AddRange(patients);

            // Save changes to get IDs
            context.SaveChanges();

            // Create some appointments
            var appointments = new[]
            {
                new Appointment
                {
                    DoctorId = doctors[0].Id,
                    PatientId = patients[0].Id,
                    AppointmentDate = DateTime.Now.AddDays(7),
                    Status = "Scheduled",
                    Notes = "Regular checkup"
                },
                new Appointment
                {
                    DoctorId = doctors[1].Id,
                    PatientId = patients[1].Id,
                    AppointmentDate = DateTime.Now.AddDays(14),
                    Status = "Scheduled",
                    Notes = "Follow-up appointment"
                }
            };
            context.Appointments.AddRange(appointments);

            // Create some medical records
            var medicalRecords = new[]
            {
                new MedicalRecord
                {
                    PatientId = patients[0].Id,
                    RecordDate = DateTime.Now.AddDays(-30),
                    Diagnosis = "Hypertension",
                    Treatment = "Prescribed blood pressure medication",
                    Notes = "Patient needs to monitor blood pressure daily"
                },
                new MedicalRecord
                {
                    PatientId = patients[1].Id,
                    RecordDate = DateTime.Now.AddDays(-15),
                    Diagnosis = "Common cold",
                    Treatment = "Rest and fluids",
                    Notes = "Follow up if symptoms persist"
                }
            };
            context.MedicalRecords.AddRange(medicalRecords);

            context.SaveChanges();
        }
    }
} 
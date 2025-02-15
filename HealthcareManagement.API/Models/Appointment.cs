using System.ComponentModel.DataAnnotations;

namespace HealthcareManagement.API.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;

        public string? Notes { get; set; }

        // Foreign keys
        public int DoctorId { get; set; }
        public int PatientId { get; set; }

        // Navigation properties
        public Doctor Doctor { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
    }
} 
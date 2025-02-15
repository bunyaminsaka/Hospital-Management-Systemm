using System.ComponentModel.DataAnnotations;

namespace HealthcareManagement.API.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string PWZNumber { get; set; } = string.Empty;  // Medical license number

        [Required]
        [StringLength(100)]
        public string Specialty { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string WorkHours { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        // Navigation properties
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public int? UserId { get; set; }
        public User? User { get; set; }
    }
} 
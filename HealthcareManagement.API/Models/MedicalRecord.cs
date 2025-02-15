using System.ComponentModel.DataAnnotations;

namespace HealthcareManagement.API.Models
{
    public class MedicalRecord
    {
        public int Id { get; set; }

        [Required]
        public DateTime RecordDate { get; set; }

        [Required]
        public string Diagnosis { get; set; } = string.Empty;

        [Required]
        public string Treatment { get; set; } = string.Empty;

        public string? Notes { get; set; }

        // Foreign key
        public int PatientId { get; set; }

        // Navigation property
        public Patient Patient { get; set; } = null!;
    }
} 
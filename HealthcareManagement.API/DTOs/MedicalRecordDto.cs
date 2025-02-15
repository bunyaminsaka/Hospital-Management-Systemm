namespace HealthcareManagement.API.DTOs
{
    public class MedicalRecordDto
    {
        public int Id { get; set; }
        public DateTime RecordDate { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
    }

    public class CreateMedicalRecordDto
    {
        public string Diagnosis { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int PatientId { get; set; }
    }

    public class UpdateMedicalRecordDto
    {
        public string Diagnosis { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
} 
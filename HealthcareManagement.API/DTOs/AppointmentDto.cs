namespace HealthcareManagement.API.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class CreateAppointmentDto
    {
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
    }

    public class UpdateAppointmentDto
    {
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
} 
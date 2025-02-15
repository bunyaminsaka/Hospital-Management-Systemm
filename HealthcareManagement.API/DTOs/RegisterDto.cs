namespace HealthcareManagement.API.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class RegisterDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        // Optional fields for doctor registration
        public string? Name { get; set; }
        public string? PWZNumber { get; set; }
        public string? Specialty { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
    }
} 
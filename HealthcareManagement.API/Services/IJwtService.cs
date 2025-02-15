using HealthcareManagement.API.Models;

namespace HealthcareManagement.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
} 
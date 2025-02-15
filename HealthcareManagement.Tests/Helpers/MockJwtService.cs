using HealthcareManagement.API.Services;
using HealthcareManagement.API.Models;

namespace HealthcareManagement.Tests.Helpers
{
    public class MockJwtService : IJwtService
    {
        public string GenerateToken(User user)
        {
            return "mock_jwt_token";
        }
    }
} 
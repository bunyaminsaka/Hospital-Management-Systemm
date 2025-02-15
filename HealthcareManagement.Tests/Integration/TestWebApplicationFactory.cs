using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Services;
using HealthcareManagement.Tests.Helpers;

namespace HealthcareManagement.Tests.Integration
{
    public class TestWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<HealthcareDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add test database
                services.AddDbContext<HealthcareDbContext>(options =>
                {
                    options.UseInMemoryDatabase("IntegrationTestDb");
                });

                // Build the service provider
                var sp = services.BuildServiceProvider();

                // Create a scope to obtain a reference to the database context
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<HealthcareDbContext>();

                // Ensure the database is created and seeded
                db.Database.EnsureCreated();
                TestDatabaseHelper.SeedTestData(db);
            });
        }
    }
} 
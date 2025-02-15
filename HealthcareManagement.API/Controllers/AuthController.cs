using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.DTOs;
using HealthcareManagement.API.Models;
using HealthcareManagement.API.Services;

namespace HealthcareManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HealthcareDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;

        public AuthController(
            HealthcareDbContext context, 
            IConfiguration configuration, 
            IPasswordService passwordService, 
            IJwtService jwtService)
        {
            _context = context;
            _configuration = configuration;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(DTOs.RegisterDto registerDto)
        {
            if (string.IsNullOrEmpty(registerDto.Username) || string.IsNullOrEmpty(registerDto.Password))
            {
                return BadRequest("Username and password are required");
            }

            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest("Username is already taken");
            }

            if (!IsValidRole(registerDto.Role))
            {
                return BadRequest("Invalid role");
            }

            var passwordHash = _passwordService.HashPassword(registerDto.Password);
            var user = new User
            {
                Username = registerDto.Username,
                PasswordHash = passwordHash,
                Role = registerDto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (registerDto.Role == "Doctor")
            {
                var doctor = new Doctor
                {
                    Name = registerDto.Name ?? $"Dr. {registerDto.Username}",
                    UserId = user.Id,
                    PWZNumber = registerDto.PWZNumber ?? "TBD",
                    Specialty = registerDto.Specialty ?? "General Medicine",
                    WorkHours = "9:00-17:00",
                    Email = registerDto.Email,
                    PhoneNumber = registerDto.PhoneNumber
                };

                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();
            }

            var token = _jwtService.GenerateToken(user);
            
            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            
            if (user == null)
            {
                return Unauthorized("Invalid username or password");
            }

            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid username or password");
            }

            var token = _jwtService.GenerateToken(user);
            
            return Ok(new AuthResponse
            {
                Token = token,
                Role = user.Role
            });
        }

        private bool IsValidRole(string role)
        {
            return role switch
            {
                "Admin" or "Doctor" or "User" => true,
                _ => false
            };
        }
    }
} 
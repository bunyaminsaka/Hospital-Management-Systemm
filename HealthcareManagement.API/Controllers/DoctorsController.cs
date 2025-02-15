using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace HealthcareManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // Re-enable authentication
    public class DoctorsController : BaseApiController
    {
        private readonly HealthcareDbContext _context;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(HealthcareDbContext context, ILogger<DoctorsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/doctors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors()
        {
            var doctors = await _context.Doctors
                .Select(d => new DoctorDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    PWZNumber = d.PWZNumber,
                    Specialty = d.Specialty,
                    WorkHours = d.WorkHours,
                    PhoneNumber = d.PhoneNumber,
                    Email = d.Email
                })
                .ToListAsync();

            return Ok(doctors);
        }

        // GET: api/doctors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound();
            }

            var doctorDto = new DoctorDto
            {
                Id = doctor.Id,
                Name = doctor.Name,
                Specialty = doctor.Specialty,
                PhoneNumber = doctor.PhoneNumber,
                Email = doctor.Email
            };

            return Ok(doctorDto);
        }

        // POST: api/doctors
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<DoctorDto>> CreateDoctor(CreateDoctorDto doctorDto)
        {
            var doctor = new Doctor
            {
                Name = doctorDto.Name,
                Specialty = doctorDto.Specialty,
                PhoneNumber = doctorDto.PhoneNumber,
                Email = doctorDto.Email
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetDoctor),
                new { id = doctor.Id },
                new DoctorDto
                {
                    Id = doctor.Id,
                    Name = doctor.Name,
                    Specialty = doctor.Specialty,
                    PhoneNumber = doctor.PhoneNumber,
                    Email = doctor.Email
                });
        }

        // PUT: api/doctors/5
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, UpdateDoctorDto doctorDto)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound();
            }

            doctor.Name = doctorDto.Name;
            doctor.Specialty = doctorDto.Specialty;
            doctor.PhoneNumber = doctorDto.PhoneNumber;
            doctor.Email = doctorDto.Email;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/doctors/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/doctors/specialty/{specialty}
        [HttpGet("specialty/{specialty}")]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctorsBySpecialty(string specialty)
        {
            var doctors = await _context.Doctors
                .Where(d => d.Specialty.ToLower().Contains(specialty.ToLower()))
                .Select(d => new DoctorDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Specialty = d.Specialty,
                    PhoneNumber = d.PhoneNumber,
                    Email = d.Email
                })
                .ToListAsync();

            return Ok(doctors);
        }

        // GET: api/doctors/user/{userId}
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Doctor")]  // Re-enable role check
        public async Task<ActionResult<DoctorDto>> GetDoctorByUserId(int userId)
        {
            var user = User;
            _logger.LogInformation("User claims: {Claims}", string.Join(", ", user.Claims.Select(c => $"{c.Type}: {c.Value}")));
            _logger.LogInformation("Requesting doctor for userId: {UserId}", userId);

            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor == null)
            {
                _logger.LogWarning("No doctor found for userId: {UserId}", userId);
                return NotFound($"No doctor found for user ID: {userId}");
            }

            var doctorDto = new DoctorDto
            {
                Id = doctor.Id,
                Name = doctor.Name,
                PWZNumber = doctor.PWZNumber,
                Specialty = doctor.Specialty,
                WorkHours = doctor.WorkHours,
                PhoneNumber = doctor.PhoneNumber,
                Email = doctor.Email
            };

            return Ok(doctorDto);
        }

        // GET: api/doctors/{doctorId}/appointments
        [HttpGet("{doctorId}/appointments")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetDoctorAppointments(int doctorId)
        {
            var doctor = await _context.Doctors.FindAsync(doctorId);
            if (doctor == null)
            {
                return NotFound($"Doctor with ID {doctorId} not found");
            }

            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.DoctorId == doctorId)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    DoctorId = a.DoctorId,
                    PatientId = a.PatientId,
                    DoctorName = a.Doctor.Name,
                    PatientName = a.Patient.Name,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return Ok(appointments);
        }

        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.Id == id);
        }
    }
} 
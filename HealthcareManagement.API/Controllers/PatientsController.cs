using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HealthcareManagement.API.Data;
using HealthcareManagement.API.Models;
using HealthcareManagement.API.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace HealthcareManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientsController : BaseApiController
    {
        private readonly HealthcareDbContext _context;

        public PatientsController(HealthcareDbContext context)
        {
            _context = context;
        }

        // GET: api/patients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
        {
            var patients = await _context.Patients
                .Select(p => new PatientDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender,
                    PhoneNumber = p.PhoneNumber,
                    Email = p.Email
                })
                .ToListAsync();

            return Ok(patients);
        }

        // GET: api/patients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound();
            }

            var patientDto = new PatientDto
            {
                Id = patient.Id,
                Name = patient.Name,
                DateOfBirth = patient.DateOfBirth,
                Gender = patient.Gender,
                PhoneNumber = patient.PhoneNumber,
                Email = patient.Email
            };

            return Ok(patientDto);
        }

        // POST: api/patients
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPost]
        public async Task<ActionResult<PatientDto>> CreatePatient(CreatePatientDto patientDto)
        {
            var patient = new Patient
            {
                Name = patientDto.Name,
                DateOfBirth = patientDto.DateOfBirth,
                Gender = patientDto.Gender,
                PhoneNumber = patientDto.PhoneNumber,
                Email = patientDto.Email
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPatient),
                new { id = patient.Id },
                new PatientDto
                {
                    Id = patient.Id,
                    Name = patient.Name,
                    DateOfBirth = patient.DateOfBirth,
                    Gender = patient.Gender,
                    PhoneNumber = patient.PhoneNumber,
                    Email = patient.Email
                });
        }

        // PUT: api/patients/5
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, UpdatePatientDto updateDto)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
                return NotFound();

            patient.Name = updateDto.Name;
            patient.DateOfBirth = updateDto.DateOfBirth;
            patient.Gender = updateDto.Gender;
            patient.PhoneNumber = updateDto.PhoneNumber;
            patient.Email = updateDto.Email;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/patients/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/patients/gender/{gender}
        [HttpGet("gender/{gender}")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatientsByGender(string gender)
        {
            var patients = await _context.Patients
                .Where(p => p.Gender.ToLower() == gender.ToLower())
                .Select(p => new PatientDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender,
                    PhoneNumber = p.PhoneNumber,
                    Email = p.Email
                })
                .ToListAsync();

            return Ok(patients);
        }

        // GET: api/patients/search/{name}
        [HttpGet("search/{name}")]
        public async Task<ActionResult<IEnumerable<PatientDto>>> SearchPatients(string name)
        {
            var patients = await _context.Patients
                .Where(p => p.Name.ToLower().Contains(name.ToLower()))
                .Select(p => new PatientDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender,
                    PhoneNumber = p.PhoneNumber,
                    Email = p.Email
                })
                .ToListAsync();

            return Ok(patients);
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.Id == id);
        }
    }
} 
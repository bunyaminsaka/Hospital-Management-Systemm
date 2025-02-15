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
    public class MedicalRecordsController : BaseApiController
    {
        private readonly HealthcareDbContext _context;

        public MedicalRecordsController(HealthcareDbContext context)
        {
            _context = context;
        }

        // GET: api/medicalrecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetMedicalRecords()
        {
            var records = await _context.MedicalRecords
                .Include(m => m.Patient)
                .Select(m => new MedicalRecordDto
                {
                    Id = m.Id,
                    RecordDate = m.RecordDate,
                    Diagnosis = m.Diagnosis,
                    Treatment = m.Treatment,
                    Notes = m.Notes,
                    PatientId = m.PatientId,
                    PatientName = m.Patient.Name
                })
                .ToListAsync();

            return Ok(records);
        }

        // GET: api/medicalrecords/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalRecordDto>> GetMedicalRecord(int id)
        {
            var record = await _context.MedicalRecords
                .Include(m => m.Patient)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (record == null)
            {
                return NotFound();
            }

            var recordDto = new MedicalRecordDto
            {
                Id = record.Id,
                RecordDate = record.RecordDate,
                Diagnosis = record.Diagnosis,
                Treatment = record.Treatment,
                Notes = record.Notes,
                PatientId = record.PatientId,
                PatientName = record.Patient.Name
            };

            return Ok(recordDto);
        }

        // POST: api/medicalrecords
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPost]
        public async Task<ActionResult<MedicalRecordDto>> CreateMedicalRecord(CreateMedicalRecordDto recordDto)
        {
            var patient = await _context.Patients.FindAsync(recordDto.PatientId);
            if (patient == null)
            {
                return BadRequest("Invalid patient ID");
            }

            var record = new MedicalRecord
            {
                RecordDate = DateTime.UtcNow,
                Diagnosis = recordDto.Diagnosis,
                Treatment = recordDto.Treatment,
                Notes = recordDto.Notes,
                PatientId = recordDto.PatientId
            };

            _context.MedicalRecords.Add(record);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMedicalRecord),
                new { id = record.Id },
                new MedicalRecordDto
                {
                    Id = record.Id,
                    RecordDate = record.RecordDate,
                    Diagnosis = record.Diagnosis,
                    Treatment = record.Treatment,
                    Notes = record.Notes,
                    PatientId = record.PatientId,
                    PatientName = patient.Name
                });
        }

        // PUT: api/medicalrecords/5
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicalRecord(int id, UpdateMedicalRecordDto recordDto)
        {
            var record = await _context.MedicalRecords.FindAsync(id);

            if (record == null)
            {
                return NotFound();
            }

            record.Diagnosis = recordDto.Diagnosis;
            record.Treatment = recordDto.Treatment;
            record.Notes = recordDto.Notes;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MedicalRecordExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/medicalrecords/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalRecord(int id)
        {
            var record = await _context.MedicalRecords.FindAsync(id);
            if (record == null)
            {
                return NotFound();
            }

            _context.MedicalRecords.Remove(record);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/medicalrecords/patient/5
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetPatientMedicalRecords(int patientId)
        {
            var records = await _context.MedicalRecords
                .Include(m => m.Patient)
                .Where(m => m.PatientId == patientId)
                .Select(m => new MedicalRecordDto
                {
                    Id = m.Id,
                    RecordDate = m.RecordDate,
                    Diagnosis = m.Diagnosis,
                    Treatment = m.Treatment,
                    Notes = m.Notes,
                    PatientId = m.PatientId,
                    PatientName = m.Patient.Name
                })
                .ToListAsync();

            return Ok(records);
        }

        private bool MedicalRecordExists(int id)
        {
            return _context.MedicalRecords.Any(e => e.Id == id);
        }
    }
} 
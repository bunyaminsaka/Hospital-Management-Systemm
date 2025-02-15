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
    public class AppointmentsController : BaseApiController
    {
        private readonly HealthcareDbContext _context;

        public AppointmentsController(HealthcareDbContext context)
        {
            _context = context;
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status,
                    Notes = a.Notes,
                    DoctorId = a.DoctorId,
                    PatientId = a.PatientId,
                    DoctorName = a.Doctor.Name,
                    PatientName = a.Patient.Name
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return NotFound();
            }

            var appointmentDto = new AppointmentDto
            {
                Id = appointment.Id,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status,
                Notes = appointment.Notes,
                DoctorId = appointment.DoctorId,
                PatientId = appointment.PatientId,
                DoctorName = appointment.Doctor.Name,
                PatientName = appointment.Patient.Name
            };

            return Ok(appointmentDto);
        }

        // POST: api/appointments
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPost]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment(CreateAppointmentDto appointmentDto)
        {
            var doctor = await _context.Doctors.FindAsync(appointmentDto.DoctorId);
            var patient = await _context.Patients.FindAsync(appointmentDto.PatientId);

            if (doctor == null || patient == null)
            {
                return BadRequest("Invalid doctor or patient ID");
            }

            var appointment = new Appointment
            {
                AppointmentDate = appointmentDto.AppointmentDate,
                Status = "Scheduled",
                Notes = appointmentDto.Notes,
                DoctorId = appointmentDto.DoctorId,
                PatientId = appointmentDto.PatientId
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAppointment),
                new { id = appointment.Id },
                new AppointmentDto
                {
                    Id = appointment.Id,
                    AppointmentDate = appointment.AppointmentDate,
                    Status = appointment.Status,
                    Notes = appointment.Notes,
                    DoctorId = appointment.DoctorId,
                    PatientId = appointment.PatientId,
                    DoctorName = doctor.Name,
                    PatientName = patient.Name
                });
        }

        // PUT: api/appointments/5
        [Authorize(Roles = "Admin,Doctor")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, UpdateAppointmentDto appointmentDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            appointment.AppointmentDate = appointmentDto.AppointmentDate;
            appointment.Status = appointmentDto.Status;
            appointment.Notes = appointmentDto.Notes;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/appointments/5
        [Authorize(Roles = "Admin,Doctor")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/appointments/doctor/5
        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetDoctorAppointments(int doctorId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.DoctorId == doctorId)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status,
                    Notes = a.Notes,
                    DoctorId = a.DoctorId,
                    PatientId = a.PatientId,
                    DoctorName = a.Doctor.Name,
                    PatientName = a.Patient.Name
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // GET: api/appointments/patient/5
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetPatientAppointments(int patientId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.PatientId == patientId)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status,
                    Notes = a.Notes,
                    DoctorId = a.DoctorId,
                    PatientId = a.PatientId,
                    DoctorName = a.Doctor.Name,
                    PatientName = a.Patient.Name
                })
                .ToListAsync();

            return Ok(appointments);
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.Id == id);
        }
    }
} 
using Docmate.Core.Contracts.Appointment;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly IDoctorService _doctorService;
        private readonly ISpecialtyService _specialtyService;
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IDoctorService doctorService,
                              IWebHostEnvironment environment,
                              ISpecialtyService specialtyService,
                              IAppointmentService appointmentService,
                              ILogger<HomeController> logger)
        {
            _doctorService = doctorService;
            _specialtyService = specialtyService;
            _appointmentService = appointmentService;
            _logger = logger;
        }

        [HttpGet("get-top-doctors")]
        public async Task<IActionResult> TopDoctor()
        {
            try
            {
                var doctors = await _doctorService.GetTopDoctorsAsync();
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching top doctors");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("get-doctor-details/{doctorId:int}")]
        public async Task<IActionResult> GetDoctorDetails(int doctorId)
        {
            try
            {
                var dto = await _doctorService.GetDoctorDetailsAsync(doctorId);
                if (dto == null)
                    return NotFound($"Doctor with ID {doctorId} not found.");
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching doctor details for ID {DoctorId}", doctorId);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("add-appointment")]
        public async Task<IActionResult> CreateAppointment([FromBody] AddAppointmentDto dto)
        {
            try
            {
                // Get UserId from JWT token
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized("No authorization token provided");
                }

                var jwtHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwtToken = jwtHandler.ReadJwtToken(token);

                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "UserId" || x.Type == "sub" || x.Type == "nameid");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest("Invalid or missing UserId in token");
                }

                _logger.LogInformation("Creating appointment for UserId {UserId}, Doctor {DoctorId}, Date {Date}, Time {Time}",
                    userId, dto.DoctorId, dto.Date, dto.Time);

                // Basic validation
                if (dto.DoctorId <= 0)
                {
                    return BadRequest("Invalid doctor ID");
                }

                if (string.IsNullOrWhiteSpace(dto.Time))
                {
                    return BadRequest("Time is required");
                }

                // Additional validation: Check if the date is in the future
                if (dto.Date.Date < DateTime.Today)
                {
                    return BadRequest("Appointment date cannot be in the past");
                }

                // Use the new method that takes UserId
                await _appointmentService.CreateAppointmentByUserIdAsync(userId, dto.DoctorId, dto.Date, dto.Time);

                return Ok(new { message = "Appointment created successfully." });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error in appointment request");
                return BadRequest(ex.Message);
            }
            catch (FormatException ex)
            {
                _logger.LogWarning(ex, "Invalid time format in appointment request: {Time}", dto.Time);
                return BadRequest($"Invalid time format: {ex.Message}");
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx && sqlEx.Number == 547)
            {
                _logger.LogWarning(ex, "Foreign key constraint violation when creating appointment");

                if (sqlEx.Message.Contains("FK_Appointments_Patients_PatientId"))
                {
                    return BadRequest("Patient account not found. Please complete your profile setup.");
                }
                else if (sqlEx.Message.Contains("FK_Appointments_Doctors_DoctorId"))
                {
                    return BadRequest($"Doctor with ID {dto.DoctorId} does not exist");
                }

                return BadRequest("Referenced patient or doctor does not exist");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating appointment");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPut("update-appointment")]
        public async Task<IActionResult> UpdateAppointmentStatus([FromBody] UpdateAppointmentDto dto)
        {
            var result = await _appointmentService.UpdateStatusAsync(dto);
            if (!result)
                return BadRequest("Invalid appointment ID or status.");

            return Ok("Appointment status updated successfully.");
        }
        [HttpGet("get-doctor-reserved-slots/{doctorId:int}")]
        public async Task<IActionResult> GetDoctorReservedSlots(int doctorId)
        {
            try
            {
                var slots = await _appointmentService.GetDoctorReservedSlotsAsync(doctorId);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching reserved slots for doctor {DoctorId}", doctorId);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("get-doctor-confirmed-slots/{doctorId:int}")]
        public async Task<IActionResult> GetDoctorConfirmedSlots(int doctorId)
        {
            try
            {
                var slots = await _appointmentService.GetDoctorReservedSlotsAsync(doctorId);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching confirmed slots for doctor {DoctorId}", doctorId);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("get-all-specialties")]
        public async Task<IActionResult> GetAllSpecialtiesAsync()
        {
            try
            {
                var specialties = await _specialtyService.GetAllSpecialtyAsync();
                return Ok(specialties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching specialties");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
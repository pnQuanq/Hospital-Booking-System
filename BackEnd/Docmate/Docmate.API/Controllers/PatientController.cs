using Docmate.Core.Contracts.Patient;
using Docmate.Core.Contracts.Payment;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Services.Features;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PatientController : Controller
    {
        private readonly IPatientService _patientService;
        private readonly IWebHostEnvironment _environment;
        private readonly IAppointmentService _appointmentService;
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PatientController> _logger;
        public PatientController(IPatientService patientService,
                                 IWebHostEnvironment environment,
                                 IAppointmentService appointmentService,
                                 IPaymentService paymentService,
                                 ILogger<PatientController> logger)
        {
            _patientService = patientService;
            _environment = environment;
            _appointmentService = appointmentService;
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] IFormFile image,
                                               [FromForm] string fullName,
                                               [FromForm] string gender,
                                               [FromForm] DateTime dateOfBirth,
                                               [FromForm] float weight,
                                               [FromForm] float height,
                                               [FromForm] string allergy)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }

            // Save image file
            string imagePath = null;
            if (image != null && image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "patients");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                }

                imagePath = $"/uploads/patients/{uniqueFileName}";
            }

            // Build DTO manually
            var dto = new UpdatePatientDto
            {
                FullName = fullName,
                Gender = gender,
                DateOfBirth = dateOfBirth,
                Weight = weight,
                Height = height,
                Allergy = allergy,
                ImageUrl = imagePath
            };

            var success = await _patientService.UpdatePatientProfileAsync(userId, dto);
            if (!success) return NotFound("Patient not found.");

            return Ok("Profile updated successfully.");
        }


        [HttpGet("get-details")]
        public async Task<IActionResult> GetPatientDetails()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }
            var result = await _patientService.GetPatientDetailsAsync(userId);

            if (result == null) return NotFound("Patient not found.");
            return Ok(result);
        }

        [HttpGet("get-all-appointment")]
        public async Task<IActionResult> GetAllAppointmentsByPatient([FromQuery] int userId)
        {
            try
            {
                var appointments = await _appointmentService.GetAppointmentsByPatientIdAsync(userId);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("get-payment-detail/{appointmentId:int}")]
        public async Task<IActionResult> GetPaymentDetail(int appointmentId)
        {
            try
            {
                var payment = await _paymentService.ShowPaymentInfoAsync(appointmentId);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost("bank-transfer")]
        public async Task<IActionResult> ProcessBankTransfer([FromBody] BankTransferPaymentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _paymentService.ProcessBankTransferAsync(dto);

                if (result.Success)
                {
                    _logger.LogInformation($"Bank transfer payment successful for appointment {dto.AppointmentId}");
                    return Ok(result);
                }
                else
                {
                    _logger.LogWarning($"Bank transfer payment failed for appointment {dto.AppointmentId}: {result.Message}");
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing bank transfer payment for appointment {dto.AppointmentId}");
                return StatusCode(500, new PaymentResponseDto
                {
                    Success = false,
                    Message = "An internal server error occurred while processing the payment"
                });
            }
        }
    }
}

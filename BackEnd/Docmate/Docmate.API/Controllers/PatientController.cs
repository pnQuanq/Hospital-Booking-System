using Docmate.Core.Contracts.Patient;
using Docmate.Core.Services.Abstractions.Features;
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
        public PatientController(IPatientService patientService, IWebHostEnvironment environment)
        {
            _patientService = patientService;
            _environment = environment;
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
    }
}

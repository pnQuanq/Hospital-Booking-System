﻿using Docmate.Core.Contracts.Appointment;
using Docmate.Core.Contracts.Doctor;
using Docmate.Core.Contracts.Specialty;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : Controller
    {
        private readonly IDoctorService _doctorService;
        private readonly ISpecialtyService _specialtyService;
        private readonly IWebHostEnvironment _environment;
        private readonly IAppointmentService _appointmentService;

        public AdminController(IDoctorService doctorService,
                               IWebHostEnvironment environment,
                               ISpecialtyService specialtyService,
                               IAppointmentService appointmentService)
        {
            _doctorService = doctorService;
            _environment = environment;
            _specialtyService = specialtyService;
            _appointmentService = appointmentService;
        }
        [HttpGet("get-all-doctors")]
        public async Task<IActionResult> GetAllDoctors()
        {
            try
            {
                var doctors = await _doctorService.GetAllDoctorsAsync();
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("add-doctor")]
        public async Task<IActionResult> AddDoctor([FromForm] IFormFile doctorImage, [FromForm] string fullName,
                                                   [FromForm] string email, [FromForm] string password,
                                                   [FromForm] int experience, [FromForm] int specialtyId,
                                                   [FromForm] string description)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Admin")
            {
                return Forbid("Only Admin can access");
            }
            // Save image file
            string imagePath = null;
            if (doctorImage != null && doctorImage.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "doctor");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(doctorImage.FileName);
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await doctorImage.CopyToAsync(fileStream);
                }

                imagePath = $"/uploads/doctor/{uniqueFileName}";
            }

            // Map to DTO
            var dto = new AddDoctorDto
            {
                FullName = fullName,
                Email = email,
                Password = password,
                Experience = experience,
                SpecialtyId = specialtyId,
                ImagePath = imagePath,
                Description = description
            };

            await _doctorService.AddDoctorAsync(dto);

            return Ok(new { message = "Doctor added successfully" });
        }

        [HttpPut("update-doctor")]
        public async Task<IActionResult> UpdateDoctor(UpdateDoctorDto dto)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim == "Patient")
            {
                return Forbid("User cannot access");
            }
            try
            {
                var doctor = await _doctorService.UpdateDoctorAsync(dto);
                return Ok(doctor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("add-specialty")]
        public async Task<IActionResult> AddSpecialty([FromForm] AddSpecialtyDto dto)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Admin")
            {
                return Forbid("Only Admin can access");
            }
            await _specialtyService.AddSpecialtyAsync(dto);
            return Ok(new { message = "Specialty added successfully" });
        }

        [HttpPut("update-specialty")]
        public async Task<IActionResult> UpdateSpecialty([FromForm] UpdateSpecialtyDto dto)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Admin")
            {
                return Forbid("Only Admin can access");
            }
            await _specialtyService.UpdateSpecialtyAsync(dto);
            return Ok(new { message = "Specialty updated successfully" });
        }

        [HttpDelete("delete-specialty/{id}")]
        public async Task<IActionResult> DeleteSpecialty(int id)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Admin")
            {
                return Forbid("Only Admin can access");
            }
            await _specialtyService.DeleteSpecialtyAsync(id);
            return Ok(new { message = "Specialty deleted successfully" });
        }

        [HttpGet("get-all-specialty")]
        public async Task<IActionResult> GetAllSpecialty()
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Admin")
            {
                return Forbid("Only Admin can access");
            }
            var specialties = await _specialtyService.GetAllSpecialtyAsync();
            return Ok(specialties);
        }
        [HttpGet("all-appointments")]
        public async Task<ActionResult<List<AdminAppointmentDto>>> GetAllAppointments()
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Admin")
            {
                return Forbid("Only Admin can access");
            }
            try
            {
                var appointments = await _appointmentService.GetAllAppointmentsForAdminAsync();
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving appointments", error = ex.Message });
            }
        }
        [HttpPut("update-appointment-status")]
        public async Task<ActionResult> UpdateAppointmentStatus([FromBody] UpdateAppointmentDto dto)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim == "Patient")
            {
                return Forbid("Only Admin can access");
            }
            try
            {
                var result = await _appointmentService.UpdateStatusAsync(dto);
                if (result)
                {
                    return Ok(new { message = "Appointment status updated successfully" });
                }
                return NotFound(new { message = "Appointment not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating appointment status", error = ex.Message });
            }
        }
    }
}

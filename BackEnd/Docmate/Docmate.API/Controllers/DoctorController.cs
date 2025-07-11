﻿using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DoctorController : Controller
    {
        private readonly IPatientService _patientService;
        private readonly IWebHostEnvironment _environment;
        private readonly IAppointmentService _appointmentService;
        private readonly IDoctorService _doctorService;
        public DoctorController(IPatientService patientService,
                                 IWebHostEnvironment environment,
                                 IAppointmentService appointmentService,
                                 IDoctorService doctorService)
        {
            _patientService = patientService;
            _environment = environment;
            _appointmentService = appointmentService;
            _doctorService = doctorService;
        }
        [HttpGet("get-details")]
        public async Task<IActionResult> GetDoctorDetails()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }
            var result = await _doctorService.GetDoctorProfileAsync(userId);

            if (result == null) return NotFound("Doctor not found.");
            return Ok(result);
        }
        [HttpGet("get-all-appointments")]
        public async Task<IActionResult> GetAllAppointments()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }

            try
            {
                var result = await _appointmentService.GetAppointmentsByDoctorIdAsync(userId);
                if (result == null) return NotFound("Doctor not found.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("get-booked-appointments")]
        public async Task<IActionResult> GetBookedAppointments()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }

            try
            {
                var result = await _appointmentService.GetBookedAppointmentAsync(userId);
                if (result == null) return NotFound("Doctor not found.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("get-patients")]
        public async Task<IActionResult> GetMyPatients()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }

            var result = await _patientService.GetPatientsByDoctorIdAsync(userId);
            return Ok(result);
        }

    }
}

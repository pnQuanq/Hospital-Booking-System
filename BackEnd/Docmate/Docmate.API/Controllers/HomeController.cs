using Docmate.Core.Contracts.Doctor;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly IDoctorService _doctorService;
        private readonly ISpecialtyService _specialtyService;

        public HomeController(IDoctorService doctorService, IWebHostEnvironment environment, ISpecialtyService specialtyService)
        {
            _doctorService = doctorService;
            _specialtyService = specialtyService;
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
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("get-doctor-details/{doctorId:int}")]
        public async Task<IActionResult> GetDoctorDetails(int doctorId)
        {
            var dto = await _doctorService.GetDoctorDetailsAsync(doctorId);
            if (dto == null)
                return NotFound($"Doctor with ID {doctorId} not found.");

            return Ok(dto);
        }
    }
}

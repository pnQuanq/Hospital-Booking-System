using Docmate.Core.Contracts.Revierw;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewController : Controller
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var roleClaim = User.FindFirst("Role")?.Value;
            if (roleClaim != "Patient")
            {
                return Forbid("Only patients can create reviews");
            }
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }
            try
            {
                var review = await _reviewService.CreateReviewAsync(dto, userId);
                return Ok(new { Success = true, Data = review, Message = "Review created successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while creating the review." });
            }
        }

        [HttpGet("{reviewId}")]
        public async Task<IActionResult> GetReview(int reviewId)
        {
            try
            {
                var review = await _reviewService.GetReviewByIdAsync(reviewId);

                if (review == null)
                {
                    return NotFound(new { Success = false, Message = "Review not found." });
                }

                return Ok(new { Success = true, Data = review });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving the review." });
            }
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetReviewByAppointment(int appointmentId)
        {
            try
            {
                var review = await _reviewService.GetReviewByAppointmentIdAsync(appointmentId);

                if (review == null)
                {
                    return NotFound(new { Success = false, Message = "Review not found for this appointment." });
                }

                return Ok(new { Success = true, Data = review });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving the review." });
            }
        }

        [HttpGet("patient")]
        public async Task<IActionResult> GetPatientReviews()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }
            try
            {
                var reviews = await _reviewService.GetReviewsByPatientIdAsync(userId);

                return Ok(new { Success = true, Data = reviews });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving patient reviews." });
            }
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetDoctorReviews(int doctorId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var reviewSummary = await _reviewService.GetDoctorReviewsAsync(doctorId, page, pageSize);
                return Ok(new { Success = true, Data = reviewSummary });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving doctor reviews." });
            }
        }

        [HttpGet("can-review/{appointmentId}")]
        public async Task<IActionResult> CanPatientReview(int appointmentId)
        {
            var roleClaim = User.FindFirst("Role")?.Value;

            if (roleClaim != "Patient")
            {
                return Forbid("Only patients can create reviews");
            }

            var userIdClaim = User.FindFirst("UserId")?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid or missing user ID claim.");
            }

            try
            {

                var canReview = await _reviewService.CanPatientReviewAsync(appointmentId, userId);

                return Ok(new { Success = true, Data = new { CanReview = canReview } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while checking review eligibility." });
            }
        }
    }
}

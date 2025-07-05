// Controller for Doctor Recommendation System

using Docmate.Core.Contracts.Recommendation;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DoctorRecommendationController : ControllerBase
{
    private readonly IDoctorRecommendationService _recommendationService;
    private readonly ILogger<DoctorRecommendationController> _logger;

    public DoctorRecommendationController(
        IDoctorRecommendationService recommendationService,
        ILogger<DoctorRecommendationController> logger)
    {
        _recommendationService = recommendationService;
        _logger = logger;
    }

    [HttpPost("recommendations")]
    public async Task<ActionResult<RecommendationResponseDto>> GetRecommendations(
        [FromBody] RecommendationRequestDto request)
    {
        try
        {
            if (request.PatientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            if (request.TopCount <= 0 || request.TopCount > 20)
            {
                request.TopCount = 5; // Default value
            }

            var recommendations = await _recommendationService.GetRecommendationsAsync(request);

            _logger.LogInformation("Generated {Count} recommendations for patient {PatientId} using {Strategy}",
                recommendations.RecommendedDoctors.Count, request.PatientId, recommendations.RecommendationStrategy);

            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for patient {PatientId}", request.PatientId);
            return StatusCode(500, "An error occurred while generating recommendations");
        }
    }

    /// <summary>
    /// Get content-based recommendations for patients with appointment history
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <param name="topCount">Number of recommendations to return (default: 5)</param>
    /// <returns>List of content-based recommendations</returns>
    [HttpGet("content-based/{patientId}")]
    public async Task<ActionResult<List<DoctorRecommendationDto>>> GetContentBasedRecommendations(
        int patientId,
        [FromQuery] int topCount = 5)
    {
        try
        {
            if (patientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            if (topCount <= 0 || topCount > 20)
            {
                topCount = 5;
            }

            var recommendations = await _recommendationService.GetContentBasedRecommendationsAsync(patientId, topCount);

            _logger.LogInformation("Generated {Count} content-based recommendations for patient {PatientId}",
                recommendations.Count, patientId);

            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content-based recommendations for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while generating content-based recommendations");
        }
    }

    /// <summary>
    /// Get popularity-based recommendations for new patients
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <param name="topCount">Number of recommendations to return (default: 5)</param>
    /// <returns>List of popularity-based recommendations</returns>
    [HttpGet("popularity-based/{patientId}")]
    public async Task<ActionResult<List<DoctorRecommendationDto>>> GetPopularityBasedRecommendations(
        int patientId,
        [FromQuery] int topCount = 5)
    {
        try
        {
            if (patientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            if (topCount <= 0 || topCount > 20)
            {
                topCount = 5;
            }

            var recommendations = await _recommendationService.GetPopularityBasedRecommendationsAsync(patientId, topCount);

            _logger.LogInformation("Generated {Count} popularity-based recommendations for patient {PatientId}",
                recommendations.Count, patientId);

            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popularity-based recommendations for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while generating popularity-based recommendations");
        }
    }

    /// <summary>
    /// Get recommendations for a specific specialty
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <param name="specialtyId">Specialty ID</param>
    /// <param name="topCount">Number of recommendations to return (default: 5)</param>
    /// <returns>List of specialty-based recommendations</returns>
    [HttpGet("specialty/{patientId}/{specialtyId}")]
    public async Task<ActionResult<List<DoctorRecommendationDto>>> GetSpecialtyBasedRecommendations(
        int patientId,
        int specialtyId,
        [FromQuery] int topCount = 5)
    {
        try
        {
            if (patientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            if (specialtyId <= 0)
            {
                return BadRequest("Invalid specialty ID");
            }

            if (topCount <= 0 || topCount > 20)
            {
                topCount = 5;
            }

            var recommendations = await _recommendationService.GetSpecialtyBasedRecommendationsAsync(patientId, specialtyId, topCount);

            _logger.LogInformation("Generated {Count} specialty-based recommendations for patient {PatientId} in specialty {SpecialtyId}",
                recommendations.Count, patientId, specialtyId);

            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting specialty-based recommendations for patient {PatientId} in specialty {SpecialtyId}",
                patientId, specialtyId);
            return StatusCode(500, "An error occurred while generating specialty-based recommendations");
        }
    }

    /// <summary>
    /// Get quick recommendations with minimal parameters
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <param name="count">Number of recommendations (default: 3)</param>
    /// <returns>Quick recommendations</returns>
    [HttpGet("quick/{patientId}")]
    public async Task<ActionResult<List<DoctorRecommendationDto>>> GetQuickRecommendations(
        int patientId,
        [FromQuery] int count = 3)
    {
        try
        {
            if (patientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            var request = new RecommendationRequestDto
            {
                PatientId = patientId,
                TopCount = Math.Min(count, 10), // Cap at 10 for quick recommendations
                OnlyAvailable = true
            };

            var recommendations = await _recommendationService.GetRecommendationsAsync(request);

            return Ok(recommendations.RecommendedDoctors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting quick recommendations for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while generating quick recommendations");
        }
    }

    /// <summary>
    /// Get recommendations with advanced filtering
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <param name="specialtyId">Preferred specialty ID (optional)</param>
    /// <param name="minRating">Minimum doctor rating (optional)</param>
    /// <param name="minExperience">Minimum experience years (optional)</param>
    /// <param name="maxExperience">Maximum experience years (optional)</param>
    /// <param name="topCount">Number of recommendations (default: 5)</param>
    /// <returns>Filtered recommendations</returns>
    [HttpGet("filtered/{patientId}")]
    public async Task<ActionResult<RecommendationResponseDto>> GetFilteredRecommendations(
        int patientId,
        [FromQuery] int? specialtyId = null,
        [FromQuery] double? minRating = null,
        [FromQuery] int? minExperience = null,
        [FromQuery] int? maxExperience = null,
        [FromQuery] int topCount = 5)
    {
        try
        {
            if (patientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            if (minRating.HasValue && (minRating < 0 || minRating > 5))
            {
                return BadRequest("Rating must be between 0 and 5");
            }

            if (minExperience.HasValue && minExperience < 0)
            {
                return BadRequest("Minimum experience cannot be negative");
            }

            if (maxExperience.HasValue && maxExperience < 0)
            {
                return BadRequest("Maximum experience cannot be negative");
            }

            if (minExperience.HasValue && maxExperience.HasValue && minExperience > maxExperience)
            {
                return BadRequest("Minimum experience cannot be greater than maximum experience");
            }

            var request = new RecommendationRequestDto
            {
                PatientId = patientId,
                PreferredSpecialtyId = specialtyId,
                MinRating = minRating,
                MinExperienceYears = minExperience,
                MaxExperienceYears = maxExperience,
                TopCount = Math.Min(topCount, 20),
                OnlyAvailable = true
            };

            var recommendations = await _recommendationService.GetRecommendationsAsync(request);

            _logger.LogInformation("Generated {Count} filtered recommendations for patient {PatientId}",
                recommendations.RecommendedDoctors.Count, patientId);

            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting filtered recommendations for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while generating filtered recommendations");
        }
    }

    /// <summary>
    /// Get recommendation statistics for a patient
    /// </summary>
    /// <param name="patientId">Patient ID</param>
    /// <returns>Recommendation statistics</returns>
    [HttpGet("stats/{patientId}")]
    public async Task<ActionResult<object>> GetRecommendationStats(int patientId)
    {
        try
        {
            if (patientId <= 0)
            {
                return BadRequest("Invalid patient ID");
            }

            // This would typically get patient's appointment history and preferences
            var request = new RecommendationRequestDto
            {
                PatientId = patientId,
                TopCount = 10,
                OnlyAvailable = true
            };

            var recommendations = await _recommendationService.GetRecommendationsAsync(request);

            var stats = new
            {
                PatientId = patientId,
                TotalRecommendations = recommendations.RecommendedDoctors.Count,
                AverageRecommendationScore = recommendations.RecommendedDoctors.Average(r => r.RecommendationScore),
                TopSpecialties = recommendations.RecommendedDoctors
                    .GroupBy(r => r.SpecialtyName)
                    .Select(g => new { Specialty = g.Key, Count = g.Count() })
                    .OrderByDescending(s => s.Count)
                    .Take(3)
                    .ToList(),
                AverageRating = recommendations.RecommendedDoctors.Average(r => r.Rating),
                AverageExperience = recommendations.RecommendedDoctors.Average(r => r.ExperienceYears),
                Strategy = recommendations.RecommendationStrategy,
                GeneratedAt = recommendations.GeneratedAt
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation stats for patient {PatientId}", patientId);
            return StatusCode(500, "An error occurred while generating recommendation statistics");
        }
    }

    /// <summary>
    /// Health check endpoint for the recommendation system
    /// </summary>
    /// <returns>Health status</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    public ActionResult<object> HealthCheck()
    {
        return Ok(new
        {
            Service = "Doctor Recommendation System",
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0"
        });
    }
}
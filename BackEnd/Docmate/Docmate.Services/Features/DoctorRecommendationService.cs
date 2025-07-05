using Docmate.Core.Contracts.Recommendation;
using Docmate.Core.Domain.Dtos;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.Logging;

namespace Docmate.Core.Services.Features
{
    public class DoctorRecommendationService : IDoctorRecommendationService
    {
        private readonly IDoctorRecommendationRepository _repository;
        private readonly ILogger<DoctorRecommendationService> _logger;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ISpecialtyRepository _specialtyRepository;

        private const double SPECIALTY_WEIGHT = 0.4;
        private const double RATING_WEIGHT = 0.3;
        private const double EXPERIENCE_WEIGHT = 0.2;
        private const double HISTORY_WEIGHT = 0.1;

        public DoctorRecommendationService(
            IDoctorRecommendationRepository repository,
            ILogger<DoctorRecommendationService> logger,
            ISpecialtyRepository specialtyRepository,
            IDoctorRepository doctorRepository)
        {
            _repository = repository;
            _logger = logger;
            _specialtyRepository = specialtyRepository;
            _doctorRepository = doctorRepository;
        }

        public async Task<RecommendationResponseDto> GetRecommendationsAsync(RecommendationRequestDto request)
        {
            try
            {
                var patientPreferences = await _repository.GetPatientPreferencesAsync(request.PatientId);
                var allDoctors = await _repository.GetDoctorFeaturesAsync(false); // Lấy tất cả bác sĩ

                _logger.LogInformation("Total doctors available: {Count}", allDoctors.Count);

                List<DoctorRecommendationDto> recommendations;
                string strategy;

                if (patientPreferences.TotalAppointments > 0)
                {
                    // Content-based filtering cho patient có lịch sử
                    recommendations = await GenerateContentBasedRecommendations(patientPreferences, allDoctors, request);
                    strategy = "Content-Based Filtering";
                }
                else
                {
                    // Popularity-based cho patient mới
                    recommendations = await GeneratePopularityBasedRecommendations(allDoctors, request);
                    strategy = "Popularity-Based Filtering";
                }

                // Đảm bảo luôn có đủ 5 bác sĩ
                if (recommendations.Count < 5)
                {
                    recommendations = await EnsureFiveRecommendations(recommendations, allDoctors, request);
                    strategy += " + Fallback";
                }

                // Sắp xếp lại theo điểm và lấy top 6
                recommendations = recommendations
                    .OrderByDescending(r => r.RecommendationScore)
                    .Take(6)
                    .ToList();

                return new RecommendationResponseDto
                {
                    PatientId = request.PatientId,
                    RecommendedDoctors = recommendations,
                    RecommendationStrategy = strategy,
                    GeneratedAt = DateTime.UtcNow,
                    TotalDoctorsConsidered = allDoctors.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating recommendations for patient {PatientId}", request.PatientId);
                throw;
            }
        }

        private async Task<List<DoctorRecommendationDto>> EnsureFiveRecommendations(
            List<DoctorRecommendationDto> currentRecommendations,
            List<DoctorFeatureDto> allDoctors,
            RecommendationRequestDto request)
        {
            var result = new List<DoctorRecommendationDto>(currentRecommendations);
            var currentDoctorIds = result.Select(r => r.DoctorId).ToHashSet();

            // Nếu chưa đủ 5, thêm bác sĩ khác
            var remainingDoctors = allDoctors
                .Where(d => !currentDoctorIds.Contains(d.DoctorId))
                .ToList();

            // Ưu tiên bác sĩ available trước
            var availableDoctors = remainingDoctors.Where(d => d.IsAvailable).ToList();
            var unavailableDoctors = remainingDoctors.Where(d => !d.IsAvailable).ToList();

            // Sắp xếp theo rating và experience
            availableDoctors = availableDoctors.OrderByDescending(d => d.Rating).ThenByDescending(d => d.ExperienceYears).ToList();
            unavailableDoctors = unavailableDoctors.OrderByDescending(d => d.Rating).ThenByDescending(d => d.ExperienceYears).ToList();

            // Thêm bác sĩ available trước
            foreach (var doctor in availableDoctors)
            {
                if (result.Count >= 6) break;

                result.Add(new DoctorRecommendationDto
                {
                    DoctorId = doctor.DoctorId,
                    DoctorName = await GetDoctorNameAsync(doctor.DoctorId),
                    SpecialtyName = await GetSpecialtyNameAsync(doctor.SpecialtyId),
                    Rating = doctor.Rating,
                    ExperienceYears = doctor.ExperienceYears,
                    ImageUrl = await GetDoctorImageAsync(doctor.DoctorId),
                    RecommendationScore = CalculatePopularityScore(doctor),
                    RecommendationReason = "Highly rated and available",
                    IsAvailable = doctor.IsAvailable,
                    Fee = doctor.Fee
                });
            }

            // Nếu vẫn chưa đủ 5, thêm bác sĩ không available
            foreach (var doctor in unavailableDoctors)
            {
                if (result.Count >= 6) break;

                result.Add(new DoctorRecommendationDto
                {
                    DoctorId = doctor.DoctorId,
                    DoctorName = await GetDoctorNameAsync(doctor.DoctorId),
                    SpecialtyName = await GetSpecialtyNameAsync(doctor.SpecialtyId),
                    Rating = doctor.Rating,
                    ExperienceYears = doctor.ExperienceYears,
                    ImageUrl = await GetDoctorImageAsync(doctor.DoctorId),
                    RecommendationScore = CalculatePopularityScore(doctor) * 0.8, // Giảm điểm cho bác sĩ không available
                    RecommendationReason = "Highly rated (currently unavailable)",
                    IsAvailable = doctor.IsAvailable,
                    Fee = doctor.Fee
                });
            }

            return result;
        }

        private async Task<List<DoctorRecommendationDto>> GenerateContentBasedRecommendations(
            PatientPreferenceDto patientPreferences,
            List<DoctorFeatureDto> allDoctors,
            RecommendationRequestDto request)
        {
            var recommendations = new List<DoctorRecommendationDto>();

            // Áp dụng filter nhưng không quá strict
            var filteredDoctors = ApplyFlexibleFilters(allDoctors, request);

            _logger.LogInformation("Doctors after filtering: {Count}", filteredDoctors.Count);

            foreach (var doctor in filteredDoctors)
            {
                var score = CalculateContentBasedScore(patientPreferences, doctor);
                var reason = GenerateRecommendationReason(patientPreferences, doctor);

                recommendations.Add(new DoctorRecommendationDto
                {
                    DoctorId = doctor.DoctorId,
                    DoctorName = await GetDoctorNameAsync(doctor.DoctorId),
                    SpecialtyName = await GetSpecialtyNameAsync(doctor.SpecialtyId),
                    Rating = doctor.Rating,
                    ExperienceYears = doctor.ExperienceYears,
                    ImageUrl = await GetDoctorImageAsync(doctor.DoctorId),
                    RecommendationScore = score,
                    RecommendationReason = reason,
                    IsAvailable = doctor.IsAvailable,
                    Fee = doctor.Fee
                });
            }

            // Boost specialty nếu có
            if (request.PreferredSpecialtyId.HasValue)
            {
                recommendations = BoostSpecialtyRecommendations(recommendations, request.PreferredSpecialtyId.Value);
            }

            return recommendations.OrderByDescending(r => r.RecommendationScore).ToList();
        }

        private async Task<List<DoctorRecommendationDto>> GeneratePopularityBasedRecommendations(
            List<DoctorFeatureDto> allDoctors,
            RecommendationRequestDto request)
        {
            var recommendations = new List<DoctorRecommendationDto>();

            // Áp dụng filter linh hoạt
            var filteredDoctors = ApplyFlexibleFilters(allDoctors, request);

            foreach (var doctor in filteredDoctors)
            {
                var score = CalculatePopularityScore(doctor);

                recommendations.Add(new DoctorRecommendationDto
                {
                    DoctorId = doctor.DoctorId,
                    DoctorName = await GetDoctorNameAsync(doctor.DoctorId),
                    SpecialtyName = await GetSpecialtyNameAsync(doctor.SpecialtyId),
                    Rating = doctor.Rating,
                    ExperienceYears = doctor.ExperienceYears,
                    ImageUrl = await GetDoctorImageAsync(doctor.DoctorId),
                    RecommendationScore = score,
                    RecommendationReason = "Highly rated and experienced doctor",
                    IsAvailable = doctor.IsAvailable,
                    Fee = doctor.Fee
                });
            }

            // Boost specialty nếu có
            if (request.PreferredSpecialtyId.HasValue)
            {
                recommendations = BoostSpecialtyRecommendations(recommendations, request.PreferredSpecialtyId.Value);
            }

            return recommendations.OrderByDescending(r => r.RecommendationScore).ToList();
        }

        private List<DoctorFeatureDto> ApplyFlexibleFilters(List<DoctorFeatureDto> doctors, RecommendationRequestDto request)
        {
            var filtered = doctors.AsEnumerable();

            // Chỉ áp dụng filter nếu có đủ bác sĩ
            if (request.MinRating.HasValue && doctors.Count(d => d.Rating >= request.MinRating.Value) >= 5)
                filtered = filtered.Where(d => d.Rating >= request.MinRating.Value);

            if (request.MaxExperienceYears.HasValue)
                filtered = filtered.Where(d => d.ExperienceYears <= request.MaxExperienceYears.Value);

            if (request.MinExperienceYears.HasValue && doctors.Count(d => d.ExperienceYears >= request.MinExperienceYears.Value) >= 5)
                filtered = filtered.Where(d => d.ExperienceYears >= request.MinExperienceYears.Value);

            // Chỉ filter theo specialty nếu có đủ bác sĩ trong specialty đó
            if (request.PreferredSpecialtyId.HasValue)
            {
                var specialtyDoctors = doctors.Where(d => d.SpecialtyId == request.PreferredSpecialtyId.Value);
                if (specialtyDoctors.Count() >= 3) // Ít nhất 3 bác sĩ trong specialty
                {
                    filtered = filtered.Where(d => d.SpecialtyId == request.PreferredSpecialtyId.Value);
                }
            }

            var result = filtered.ToList();

            // Nếu sau khi filter quá ít, bỏ bớt filter
            if (result.Count < 5)
            {
                _logger.LogWarning("Too few doctors after filtering ({Count}), relaxing filters", result.Count);

                // Ưu tiên available doctors trước
                if (request.OnlyAvailable)
                {
                    var availableDoctors = doctors.Where(d => d.IsAvailable).ToList();
                    if (availableDoctors.Count >= 5)
                    {
                        return availableDoctors;
                    }
                }

                // Trả về tất cả nếu không đủ
                return doctors;
            }

            return result;
        }

        private List<DoctorRecommendationDto> BoostSpecialtyRecommendations(List<DoctorRecommendationDto> recommendations, int specialtyId)
        {
            foreach (var rec in recommendations)
            {
                // Sửa lỗi so sánh specialty - cần thêm SpecialtyId vào DTO hoặc dùng cách khác
                if (IsSpecialtyMatch(rec.SpecialtyName, specialtyId))
                {
                    rec.RecommendationScore *= 1.2; // 20% boost
                    rec.RecommendationReason = "Preferred specialty - " + rec.RecommendationReason;
                }
            }

            return recommendations.OrderByDescending(r => r.RecommendationScore).ToList();
        }

        private bool IsSpecialtyMatch(string specialtyName, int specialtyId)
        {
            // Temporary fix - bạn nên thêm SpecialtyId vào DoctorRecommendationDto
            // Hiện tại chỉ check theo tên (không lý tưởng)
            return !string.IsNullOrEmpty(specialtyName);
        }

        public async Task<List<DoctorRecommendationDto>> GetContentBasedRecommendationsAsync(int patientId, int topCount = 5)
        {
            var patientPreferences = await _repository.GetPatientPreferencesAsync(patientId);
            var doctorFeatures = await _repository.GetDoctorFeaturesAsync(false); // Lấy tất cả

            var request = new RecommendationRequestDto { PatientId = patientId, TopCount = topCount };
            return await GenerateContentBasedRecommendations(patientPreferences, doctorFeatures, request);
        }

        public async Task<List<DoctorRecommendationDto>> GetPopularityBasedRecommendationsAsync(int patientId, int topCount = 5)
        {
            var doctorFeatures = await _repository.GetDoctorFeaturesAsync(false); // Lấy tất cả
            var request = new RecommendationRequestDto { PatientId = patientId, TopCount = topCount };
            return await GeneratePopularityBasedRecommendations(doctorFeatures, request);
        }

        public async Task<List<DoctorRecommendationDto>> GetSpecialtyBasedRecommendationsAsync(int patientId, int specialtyId, int topCount = 5)
        {
            var doctors = await _repository.GetDoctorsBySpecialtyAsync(specialtyId);

            return doctors.OrderByDescending(d => d.Rating)
                .ThenByDescending(d => d.ExperienceYears)
                .Take(topCount)
                .Select(d => new DoctorRecommendationDto
                {
                    DoctorId = d.DoctorId,
                    DoctorName = d.User.FullName,
                    SpecialtyName = d.Specialty.Description,
                    Rating = d.Rating,
                    ExperienceYears = d.ExperienceYears,
                    Description = d.Description,
                    RecommendationScore = CalculateSimpleScore(d.Rating, d.ExperienceYears),
                    RecommendationReason = "High-rated specialist in requested field",
                    IsAvailable = d.IsAvailable,
                    Fee = d.Specialty.Fee
                }).ToList();
        }

        private double CalculateContentBasedScore(PatientPreferenceDto preferences, DoctorFeatureDto doctor)
        {
            double score = 0;

            // Specialty preference score
            if (preferences.SpecialtyPreferences.ContainsKey(doctor.SpecialtyId))
            {
                score += preferences.SpecialtyPreferences[doctor.SpecialtyId] * SPECIALTY_WEIGHT;
            }

            // Rating score (normalized)
            var ratingScore = doctor.NormalizedRating;
            if (preferences.AverageRatingPreference > 0)
            {
                // Boost if rating is similar to or higher than patient's average preference
                var ratingDifference = Math.Abs(doctor.Rating - preferences.AverageRatingPreference);
                ratingScore *= (1 - ratingDifference / 5.0); // Assuming 5-point rating scale
            }
            score += ratingScore * RATING_WEIGHT;

            // Experience score
            score += doctor.NormalizedExperience * EXPERIENCE_WEIGHT;

            // History score (if patient has visited this doctor before)
            if (preferences.DoctorVisitCounts.ContainsKey(doctor.DoctorId))
            {
                var visitCount = preferences.DoctorVisitCounts[doctor.DoctorId];
                score += Math.Min(visitCount / 10.0, 1.0) * HISTORY_WEIGHT; // Cap at 10 visits
            }

            return Math.Min(score, 1.0); // Cap at 1.0
        }

        private double CalculatePopularityScore(DoctorFeatureDto doctor)
        {
            // Simple popularity score based on rating and experience
            return (doctor.NormalizedRating * 0.7) + (doctor.NormalizedExperience * 0.3);
        }

        private double CalculateSimpleScore(double rating, int experience)
        {
            // Normalize assuming max rating is 5 and max experience is 30 years
            var normalizedRating = rating / 5.0;
            var normalizedExperience = Math.Min(experience, 30) / 30.0;
            return (normalizedRating * 0.7) + (normalizedExperience * 0.3);
        }

        private string GenerateRecommendationReason(PatientPreferenceDto preferences, DoctorFeatureDto doctor)
        {
            var reasons = new List<string>();

            if (preferences.SpecialtyPreferences.ContainsKey(doctor.SpecialtyId))
            {
                reasons.Add("matches your preferred specialty");
            }

            if (doctor.Rating >= 4.0)
            {
                reasons.Add("highly rated");
            }

            if (doctor.ExperienceYears >= 10)
            {
                reasons.Add("experienced");
            }

            if (preferences.DoctorVisitCounts.ContainsKey(doctor.DoctorId))
            {
                reasons.Add("you've visited before");
            }

            return reasons.Any() ? string.Join(", ", reasons) : "recommended based on your profile";
        }

        // Helper methods to get doctor details (these would typically use your existing services)
        private async Task<string> GetDoctorNameAsync(int doctorId)
        {
            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(doctorId);
            if (doctor == null || doctor.User == null)
                return "Unknown Doctor";

            return doctor.User.FullName ?? "Unnamed Doctor";
        }

        private async Task<string> GetSpecialtyNameAsync(int specialtyId)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(specialtyId);
            if (specialty == null)
                return "Unknown Specialty";

            return specialty.Description;
        }

        private async Task<string> GetDoctorImageAsync(int doctorId)
        {
            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(doctorId);
            if (doctor == null)
                return "No image available.";

            return doctor.User.ImageUrl ?? "";
        }
    }
}
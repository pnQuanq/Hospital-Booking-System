using Docmate.Core.Contracts.Recommendation;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IDoctorRecommendationService
    {
        Task<RecommendationResponseDto> GetRecommendationsAsync(RecommendationRequestDto request);
        Task<List<DoctorRecommendationDto>> GetContentBasedRecommendationsAsync(int patientId, int topCount = 5);
        Task<List<DoctorRecommendationDto>> GetPopularityBasedRecommendationsAsync(int patientId, int topCount = 5);
        Task<List<DoctorRecommendationDto>> GetSpecialtyBasedRecommendationsAsync(int patientId, int specialtyId, int topCount = 5);
    }
}

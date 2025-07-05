using Docmate.Core.Contracts.Revierw;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(CreateReviewDto dto, int patientId);
        Task<ReviewDto?> GetReviewByIdAsync(int reviewId);
        Task<ReviewDto?> GetReviewByAppointmentIdAsync(int appointmentId);
        Task<List<ReviewDto>> GetReviewsByPatientIdAsync(int patientId);
        Task<DoctorReviewSummaryDto> GetDoctorReviewsAsync(int doctorId, int page = 1, int pageSize = 10);
        Task<bool> CanPatientReviewAsync(int appointmentId, int patientId);
    }
}

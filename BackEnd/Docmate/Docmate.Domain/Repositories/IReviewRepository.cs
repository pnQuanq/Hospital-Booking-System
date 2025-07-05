using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IReviewRepository : IGenericRepository<Review>
    {
        Task<Review?> GetByIdWithDetailsAsync(int reviewId);
        Task<Review?> GetByAppointmentIdAsync(int appointmentId);
        Task<Review?> GetByAppointmentIdWithDetailsAsync(int appointmentId);
        Task<Review?> GetByIdWithAppointmentAsync(int reviewId);
        Task<List<Review>> GetByPatientIdWithDetailsAsync(int patientId);
        Task<List<Review>> GetByDoctorIdWithDetailsAsync(int doctorId, int page, int pageSize);
        Task<int> GetTotalReviewsCountByDoctorIdAsync(int doctorId);
        Task<double> GetAverageRatingByDoctorIdAsync(int doctorId);
    }
}

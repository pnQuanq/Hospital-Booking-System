using Docmate.Core.Domain.Dtos;
using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IDoctorRecommendationRepository
    {
        Task<PatientPreferenceDto> GetPatientPreferencesAsync(int patientId);
        Task<List<DoctorFeatureDto>> GetDoctorFeaturesAsync(bool onlyAvailable = true);
        Task<List<Appointment>> GetPatientAppointmentHistoryAsync(int patientId);
        Task<List<Doctor>> GetDoctorsBySpecialtyAsync(int specialtyId);
        Task<Dictionary<int, double>> GetDoctorRatingStatisticsAsync();
        Task<Dictionary<int, int>> GetDoctorExperienceStatisticsAsync();
    }
}

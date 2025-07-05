using Docmate.Core.Domain.Dtos;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using Microsoft.EntityFrameworkCore;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class DoctorRecommendationRepository : IDoctorRecommendationRepository
    {
        private readonly ApplicationDbContext _context;

        public DoctorRecommendationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PatientPreferenceDto> GetPatientPreferencesAsync(int patientId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .ThenInclude(d => d.Specialty)
                .Where(a => a.PatientId == patientId && a.Status == AppointmentStatus.Completed)
                .ToListAsync();

            var preference = new PatientPreferenceDto
            {
                PatientId = patientId,
                TotalAppointments = appointments.Count
            };

            if (!appointments.Any())
                return preference;

            // Calculate specialty preferences based on appointment frequency
            var specialtyGroups = appointments.GroupBy(a => a.Doctor.SpecialtyId);
            foreach (var group in specialtyGroups)
            {
                var frequency = (double)group.Count() / appointments.Count;
                preference.SpecialtyPreferences[group.Key] = frequency;
            }

            // Calculate doctor visit counts
            var doctorGroups = appointments.GroupBy(a => a.DoctorId);
            foreach (var group in doctorGroups)
            {
                preference.DoctorVisitCounts[group.Key] = group.Count();
            }

            // Calculate doctor rating history (based on appointments with that doctor)
            foreach (var group in doctorGroups)
            {
                var doctorRating = group.First().Doctor.Rating;
                preference.DoctorRatingHistory[group.Key] = doctorRating;
            }

            // Calculate average rating preference
            preference.AverageRatingPreference = appointments.Average(a => a.Doctor.Rating);

            return preference;
        }

        public async Task<List<DoctorFeatureDto>> GetDoctorFeaturesAsync(bool onlyAvailable = true)
        {
            var query = _context.Doctors
                .Include(d => d.Specialty)
                .AsQueryable();

            if (onlyAvailable)
                query = query.Where(d => d.IsAvailable);

            var doctors = await query.ToListAsync();

            // Get normalization values
            var maxRating = doctors.Max(d => d.Rating);
            var minRating = doctors.Min(d => d.Rating);
            var maxExperience = doctors.Max(d => d.ExperienceYears);
            var minExperience = doctors.Min(d => d.ExperienceYears);

            return doctors.Select(d => new DoctorFeatureDto
            {
                DoctorId = d.DoctorId,
                SpecialtyId = d.SpecialtyId,
                Rating = d.Rating,
                ExperienceYears = d.ExperienceYears,
                NormalizedRating = NormalizeValue(d.Rating, minRating, maxRating),
                NormalizedExperience = NormalizeValue(d.ExperienceYears, minExperience, maxExperience),
                IsAvailable = d.IsAvailable,
                Fee = d.Specialty.Fee
            }).ToList();
        }

        public async Task<List<Appointment>> GetPatientAppointmentHistoryAsync(int patientId)
        {
            return await _context.Appointments
                .Include(a => a.Doctor)
                .ThenInclude(d => d.Specialty)
                .Include(a => a.Review)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }

        public async Task<List<Doctor>> GetDoctorsBySpecialtyAsync(int specialtyId)
        {
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .Where(d => d.SpecialtyId == specialtyId && d.IsAvailable)
                .ToListAsync();
        }

        public async Task<Dictionary<int, double>> GetDoctorRatingStatisticsAsync()
        {
            return await _context.Doctors
                .Where(d => d.IsAvailable)
                .ToDictionaryAsync(d => d.DoctorId, d => d.Rating);
        }

        public async Task<Dictionary<int, int>> GetDoctorExperienceStatisticsAsync()
        {
            return await _context.Doctors
                .Where(d => d.IsAvailable)
                .ToDictionaryAsync(d => d.DoctorId, d => d.ExperienceYears);
        }

        private double NormalizeValue(double value, double min, double max)
        {
            if (max == min) return 0.5; // Avoid division by zero
            return (value - min) / (max - min);
        }
    }
}

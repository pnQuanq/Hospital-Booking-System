using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using Microsoft.EntityFrameworkCore;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class ReviewRepository : GenericRepository<Review>, IReviewRepository
    {
        public ReviewRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<double> GetAverageRatingByDoctorIdAsync(int doctorId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.DoctorId == doctorId)
                .Select(r => r.Rating)
                .ToListAsync();

            if (ratings.Count == 0)
                return 0;

            return ratings.Average();
        }

        public async Task<Review?> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _context.Reviews
                .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
        }

        public async Task<Review?> GetByAppointmentIdWithDetailsAsync(int appointmentId)
        {
            return await _context.Reviews
                .Include(r => r.Patient)
                    .ThenInclude(p => p.User)
                .Include(r => r.Doctor)
                    .ThenInclude(d => d.User)
                .Include(r => r.Appointment)
                .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
        }

        public async Task<List<Review>> GetByDoctorIdWithDetailsAsync(int doctorId, int page, int pageSize)
        {
            return await _context.Reviews
                .Include(r => r.Patient)
                    .ThenInclude(p => p.User)
                .Include(r => r.Doctor)
                    .ThenInclude(d => d.User)
                .Include(r => r.Appointment)
                .Where(r => r.DoctorId == doctorId)
                .OrderByDescending(r => r.DateCreated)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Review?> GetByIdWithAppointmentAsync(int reviewId)
        {
            return await _context.Reviews
                .Include(r => r.Appointment)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        }

        public async Task<Review?> GetByIdWithDetailsAsync(int reviewId)
        {
            return await _context.Reviews
                .Include(r => r.Patient)
                    .ThenInclude(p => p.User)
                .Include(r => r.Doctor)
                    .ThenInclude(d => d.User)
                .Include(r => r.Appointment)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        }

        public async Task<List<Review>> GetByPatientIdWithDetailsAsync(int patientId)
        {
            return await _context.Reviews
                .Include(r => r.Patient)
                    .ThenInclude(p => p.User)
                .Include(r => r.Doctor)
                    .ThenInclude(d => d.User)
                .Include(r => r.Appointment)
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.DateCreated)
                .ToListAsync();
        }

        public async Task<int> GetTotalReviewsCountByDoctorIdAsync(int doctorId)
        {
            return await _context.Reviews
                .CountAsync(r => r.DoctorId == doctorId);
        }
    }
}

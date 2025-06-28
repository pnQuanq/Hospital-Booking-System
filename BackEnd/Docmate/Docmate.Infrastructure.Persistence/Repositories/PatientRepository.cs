using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using Microsoft.EntityFrameworkCore;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        public PatientRepository(ApplicationDbContext context) : base(context)
        {
        }
        public async Task<Patient> GetByUserIdAsync(int userId)
        {
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }
        public async Task<List<Patient>> GetPatientsByDoctorIdAsync(int doctorId)
        {
            return await _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.Status == AppointmentStatus.Completed)
                .Include(a => a.Patient)
                    .ThenInclude(p => p.User)
                .Select(a => a.Patient)
                .Distinct()
                .ToListAsync();
        }
        public DateTime? CalculateLastVisit(Patient patient)
        {
            return patient.Appointments?
                .Where(a => a.Status == AppointmentStatus.Completed)
                .OrderByDescending(a => a.Date)
                .Select(a => a.Date)
                .FirstOrDefault();
        }


    }
}

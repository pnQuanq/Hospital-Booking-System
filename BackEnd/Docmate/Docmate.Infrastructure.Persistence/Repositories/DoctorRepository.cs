using Microsoft.EntityFrameworkCore;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDbContext context) : base(context)
        {
        }
        public async Task<List<Doctor>> GetAllWithSpecialtyAsync()
        {
            return await _context.Doctors
                .Include(p => p.Specialty)
                .Include(d => d.User)
                .ToListAsync();
        }
        public async Task<Doctor> GetByIdWithUserAndSpecialtyAsync(int doctorId)
        {
            return await _context.Doctors
                        .Include(d => d.User)
                        .Include(p => p.Specialty)
                        .FirstOrDefaultAsync(d => d.DoctorId == doctorId);
        }
        public async Task<Doctor> GetByUserIdAsync(int userId)
        {
            return await _context.Doctors
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }
    }
}

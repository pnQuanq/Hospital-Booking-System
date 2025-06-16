using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class TimeSlotRepository : GenericRepository<TimeSlot>, ITimeSlotRepository
    {
        public TimeSlotRepository(ApplicationDbContext context) : base(context)
        {
        }
        public async Task<TimeSlot> GetByDoctorAndTimeAsync(int doctorId, DateTime time)
        {
            return await _context.Set<TimeSlot>()
                .FirstOrDefaultAsync(ts => ts.DoctorId == doctorId && ts.Time == time);
        }

        public async Task<List<TimeSlot>> GetDoctorReservedSlotsAsync(int doctorId)
        {
            return await _context.Set<TimeSlot>()
                .Where(ts => ts.DoctorId == doctorId && ts.Status == TimeSlotStatus.Reserved)
                .ToListAsync();
        }
        public async Task<List<TimeSlot>> GetDoctorConfirmedSlotsAsync(int doctorId)
        {
            return await _context.Set<TimeSlot>()
                .Where(ts => ts.DoctorId == doctorId && ts.Status == TimeSlotStatus.Confirmed)
                .ToListAsync();
        }
    }
}

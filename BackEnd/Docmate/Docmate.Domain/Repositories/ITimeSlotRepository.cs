using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface ITimeSlotRepository : IGenericRepository<TimeSlot>
    {
        Task<TimeSlot> GetByDoctorAndTimeAsync(int doctorId, DateTime time);
        Task<List<TimeSlot>> GetDoctorReservedSlotsAsync(int doctorId);
        Task<List<TimeSlot>> GetDoctorConfirmedSlotsAsync(int doctorId);
    }
}

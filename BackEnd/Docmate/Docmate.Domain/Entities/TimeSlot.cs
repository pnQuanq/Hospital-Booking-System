
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class TimeSlot : BaseEntity
    {
        public int TimeSlotId { get; set; }
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }
        public DateTime Time { get; set; }
        public TimeSlotStatus Status { get; set; } = TimeSlotStatus.Free; // Free, Reserved, Confirmed

    }
}

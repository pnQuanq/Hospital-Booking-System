
namespace Docmate.Core.Domain.Entities
{
    public class TimeSlot
    {
        public Guid TimeSlotId { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public bool IsAvailable { get; set; }
    }
}


namespace Docmate.Core.Domain.Entities
{
    public class TimeSlot
    {
        public int TimeSlotId { get; set; }

        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public bool IsAvailable { get; set; }
    }
}

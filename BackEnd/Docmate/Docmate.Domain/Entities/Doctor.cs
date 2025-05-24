
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Doctor : BaseEntity
    {
        public int DoctorId { get; set; }
        public int UserId { get; set; }
        public ApplicationUser User { get; set; }

        public int SpecialtyId { get; set; }
        public Specialty Specialty { get; set; }

        public int ExperienceYears { get; set; }
        public string Description { get; set; }
        public bool IsAvailable { get; set; } = true;
        public double Rating { get; set; }

        public ICollection<TimeSlot> TimeSlots { get; set; }
        public ICollection<Appointment> Appointments { get; set; }

    }
}

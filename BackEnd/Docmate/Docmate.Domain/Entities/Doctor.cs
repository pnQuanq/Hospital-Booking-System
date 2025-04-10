
using Docmate.Domain.Common;

namespace Docmate.Domain.Entities
{
    public class Doctor : BaseEntity
    {
        public Guid DoctorId { get; set; }
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }

        public string SpecialtyId { get; set; }
        public Specialty Specialty { get; set; }

        public int ExperienceYears { get; set; }
        public string Description { get; set; }
        public double Rating { get; set; }

        public ICollection<TimeSlot> TimeSlots { get; set; }
        public ICollection<Appointment> Appointments { get; set; }

    }
}

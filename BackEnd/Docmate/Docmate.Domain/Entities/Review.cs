
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Review : BaseEntity
    {
        public Guid ReviewId { get; set; }

        public Guid AppointmentId { get; set; }
        public Appointment Appointment { get; set; }

        public Guid PatientId { get; set; }
        public Patient Patient { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public int Rating { get; set; } // 1 to 5
        public string Comment { get; set; }
    }
}

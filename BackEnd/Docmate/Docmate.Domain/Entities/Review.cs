
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Review : BaseEntity
    {
        public int ReviewId { get; set; }

        public int AppointmentId { get; set; }
        public Appointment Appointment { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public int Rating { get; set; } // 1 to 5
        public string Comment { get; set; }
    }
}

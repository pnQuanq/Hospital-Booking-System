
using Docmate.Domain.Common;

namespace Docmate.Domain.Entities
{
    public class Appointment : BaseEntity
    {
        public Guid AppointmentId { get; set; }

        public Guid PatientId { get; set; }
        public Patient Patient { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public DateTime Date { get; set; }
        public AppointmentStatus Status { get; set; } // Scheduled, Completed, Cancelled

        public Review Review { get; set; }
    }
}

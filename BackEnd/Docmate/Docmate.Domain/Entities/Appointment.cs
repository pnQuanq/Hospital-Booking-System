
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Appointment : BaseEntity
    {
        public int AppointmentId { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public DateTime Date { get; set; }
        public bool IsReviewed { get; set; }
        public AppointmentStatus Status { get; set; } // Scheduled, Completed, Cancelled

        public Review Review { get; set; }
        public Payment? Payment { get; set; }
    }
}

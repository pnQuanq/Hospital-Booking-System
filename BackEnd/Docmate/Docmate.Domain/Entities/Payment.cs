using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public int PaymentId { get; set; }
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public double Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; //Completed, Failed

        // Navigation properties
        public Appointment Appointment { get; set; } = null!;
        public Patient Patient { get; set; } = null;
    }
}

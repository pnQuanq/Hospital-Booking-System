using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Contracts.Appointment
{
    public class UpdateAppointmentDto
    {
        public int AppointmentId { get; set; }
        public string NewStatus { get; set; }
    }
}

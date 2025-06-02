namespace Docmate.Core.Contracts.Appointment
{
    public class AddAppointmentDto
    {
        public int DoctorId { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; }
    }
}

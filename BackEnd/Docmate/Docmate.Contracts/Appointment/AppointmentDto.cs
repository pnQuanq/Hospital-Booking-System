namespace Docmate.Core.Contracts.Appointment
{
    public class AppointmentDto
    {
        public int AppointmentId { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public string DoctorImageUrl { get; set; }
        public string Specialty {  get; set; }
        public string PatientName { get; set; }
        public int PatientId { get; set; }
        public string PatientImageUrl { get; set; }
        public string PatientGender { get; set; }

    }
}

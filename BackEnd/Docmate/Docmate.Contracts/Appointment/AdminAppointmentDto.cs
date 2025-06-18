namespace Docmate.Core.Contracts.Appointment
{
    public class AdminAppointmentDto
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientFullName { get; set; }
        public string PatientImageUrl { get; set; }
        public DateTime PatientDob { get; set; }
        public string PatientEmail { get; set; }
        public string PatientPhone { get; set; }

        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string DoctorImageUrl { get; set; }
        public string Specialty { get; set; }

        public DateTime Date { get; set; }
        public string SlotDate { get; set; } 
        public string SlotTime { get; set; } 
        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

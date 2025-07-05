namespace Docmate.Core.Contracts.Revierw
{
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}

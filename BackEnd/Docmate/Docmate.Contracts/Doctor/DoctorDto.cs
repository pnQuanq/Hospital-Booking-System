namespace Docmate.Core.Contracts.Doctor
{
    public class DoctorDto
    {
        public int DoctorId { get; set; }
        public string FullName { get; set; }
        public string ImageUrl { get; set; }
        public string Email { get; set; }

        public int SpecialtyId { get; set; }
        public string SpecialtyDescription { get; set; }

        public int ExperienceYears { get; set; }
        public string Description { get; set; }
        public double Rating { get; set; }
        public bool IsAvailable { get; set; }
    }

}

namespace Docmate.Core.Domain.Dtos
{
    public class DoctorFeatureDto
    {
        public int DoctorId { get; set; }
        public int SpecialtyId { get; set; }
        public double Rating { get; set; }
        public int ExperienceYears { get; set; }
        public double NormalizedRating { get; set; }
        public double NormalizedExperience { get; set; }
        public bool IsAvailable { get; set; }
        public double Fee { get; set; }
    }
}

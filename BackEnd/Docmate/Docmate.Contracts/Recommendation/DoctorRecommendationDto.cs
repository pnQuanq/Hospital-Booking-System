namespace Docmate.Core.Contracts.Recommendation
{
    public class DoctorRecommendationDto
    {
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string SpecialtyName { get; set; }
        public double Rating { get; set; }
        public string ImageUrl { get; set; }
        public int ExperienceYears { get; set; }
        public string Description { get; set; }
        public double RecommendationScore { get; set; }
        public string RecommendationReason { get; set; }
        public bool IsAvailable { get; set; }
        public double Fee { get; set; }
    }
}

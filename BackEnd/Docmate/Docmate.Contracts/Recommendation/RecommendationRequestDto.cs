namespace Docmate.Core.Contracts.Recommendation
{
    public class RecommendationRequestDto
    {
        public int PatientId { get; set; }
        public int? PreferredSpecialtyId { get; set; }
        public double? MinRating { get; set; }
        public int? MaxExperienceYears { get; set; }
        public int? MinExperienceYears { get; set; }
        public int TopCount { get; set; } = 5;
        public bool OnlyAvailable { get; set; } = true;
    }
}

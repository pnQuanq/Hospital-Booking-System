namespace Docmate.Core.Contracts.Revierw
{
    public class DoctorReviewSummaryDto
    {
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<ReviewDto> Reviews { get; set; } = new List<ReviewDto>();
    }
}

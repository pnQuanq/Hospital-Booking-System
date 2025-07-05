using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docmate.Core.Contracts.Recommendation
{
    public class RecommendationResponseDto
    {
        public int PatientId { get; set; }
        public List<DoctorRecommendationDto> RecommendedDoctors { get; set; } = new();
        public string RecommendationStrategy { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int TotalDoctorsConsidered { get; set; }
    }
}

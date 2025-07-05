using System.ComponentModel.DataAnnotations;

namespace Docmate.Core.Contracts.Revierw
{
    public class UpdateReviewDto
    {
        [Required]
        public int ReviewId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [Required]
        [MaxLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters")]
        public string Comment { get; set; }
    }
}

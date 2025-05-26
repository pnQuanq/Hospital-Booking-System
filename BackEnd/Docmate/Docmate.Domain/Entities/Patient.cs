

using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Patient : BaseEntity
    {
        public int PatientId { get; set; }
        public int UserId { get; set; }
        public ApplicationUser User { get; set; }

        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public float? Weight { get; set; }
        public float? Height { get; set; }
        public string? Allergy { get; set; }

        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<SymptomLog> SymptomLogs { get; set; }
    }
}

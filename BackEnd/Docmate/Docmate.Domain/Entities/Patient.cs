

using Docmate.Domain.Common;

namespace Docmate.Domain.Entities
{
    public class Patient : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; }

        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public float Weight { get; set; } // kg
        public float Height { get; set; } // cm
        public string Allergy { get; set; }

        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<SymptomLog> SymptomLogs { get; set; }
    }
}

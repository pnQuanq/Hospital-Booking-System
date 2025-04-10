
using Docmate.Domain.Common;

namespace Docmate.Domain.Entities
{
    public class SymptomLog : BaseEntity
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient Patient { get; set; }

        public string Symptoms { get; set; }
    }
}


using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class SymptomLog : BaseEntity
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient Patient { get; set; }

        public string Symptoms { get; set; }
    }
}

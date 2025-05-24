
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class SymptomLog : BaseEntity
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public string Symptoms { get; set; }
    }
}

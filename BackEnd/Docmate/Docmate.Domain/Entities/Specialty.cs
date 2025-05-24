using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class Specialty : BaseEntity
    {
        public int SpecialtyId { get; set; }
        public string Description { get; set; }

        public ICollection<Doctor> Doctors { get; set; }
    }
}



namespace Docmate.Domain.Entities
{
    public class Specialty
    {
        public string SpecialtyId { get; set; }
        public string Description { get; set; }

        public ICollection<Doctor> Doctors { get; set; }
    }
}

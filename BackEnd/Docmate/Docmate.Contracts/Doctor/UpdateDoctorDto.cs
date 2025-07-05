using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docmate.Core.Contracts.Doctor
{
    public class UpdateDoctorDto
    {
        public int DoctorId { get; set; }
        public string? FullName { get; set; }
        public string? Description { get; set; }
        public int? SpecialtyId { get; set; }
        public int? ExperienceYears { get; set; }
        public bool? IsAvailable { get; set; }
        public string? Password { get; set; }
    }
}

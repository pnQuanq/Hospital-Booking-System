using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docmate.Core.Contracts.Patient
{
    public class UpdatePatientDto
    {
        public string? FullName { get; set; }
        public string? ImageUrl { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public float? Weight { get; set; }
        public float? Height { get; set; }
        public string? Allergy { get; set; }
    }
}

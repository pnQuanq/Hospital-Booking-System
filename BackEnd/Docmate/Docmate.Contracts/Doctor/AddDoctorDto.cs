
namespace Docmate.Core.Contracts.Doctor
{
    public class AddDoctorDto
    {
        public string ImagePath { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int Experience { get; set; }
        public int SpecialtyId { get; set; }
        public string Description { get; set; }
    }
}

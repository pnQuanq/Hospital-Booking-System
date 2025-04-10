using Microsoft.AspNetCore.Identity;


namespace Docmate.Domain.Entities
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string Fullname { get; set; }
        public Patient Patient { get; set; }
        public Doctor Doctor { get; set; }
    }
}

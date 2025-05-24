using Microsoft.AspNetCore.Identity;

namespace Docmate.Core.Domain.Entities
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string? ImageUrl { get; set; } 
        public string FullName { get; set; }
        public Patient Patient { get; set; }
        public Doctor Doctor { get; set; }
    }
}

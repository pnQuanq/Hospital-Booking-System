using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IUserRepository 
    {
        Task<ApplicationUser?> GetByIdAsync(int id);
        Task<ApplicationUser?> GetByEmailAsync(string email);
        Task<IEnumerable<ApplicationUser>> GetAllAsync();
        Task AddAsync(ApplicationUser user);
        void Update(ApplicationUser user);
        void Delete(ApplicationUser user);
        Task SaveChangesAsync();
    }
}

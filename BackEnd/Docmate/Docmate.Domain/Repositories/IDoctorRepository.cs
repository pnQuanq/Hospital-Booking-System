
using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IDoctorRepository : IGenericRepository<Doctor>
    {
        Task<List<Doctor>> GetAllWithSpecialtyAsync();
        Task<Doctor> GetByIdWithUserAndSpecialtyAsync(int id);
    }
}

using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<Patient> GetByUserIdAsync(int userId);
    }
}

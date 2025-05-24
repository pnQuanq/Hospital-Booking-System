
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}

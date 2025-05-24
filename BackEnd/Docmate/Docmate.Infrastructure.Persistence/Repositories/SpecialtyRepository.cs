using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using Microsoft.EntityFrameworkCore;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class SpecialtyRepository : GenericRepository<Specialty>, ISpecialtyRepository
    {
        public SpecialtyRepository(ApplicationDbContext context) : base(context)
        {
        }

    }
}

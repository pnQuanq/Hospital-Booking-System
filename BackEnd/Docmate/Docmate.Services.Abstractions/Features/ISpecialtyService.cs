
using Docmate.Core.Contracts.Specialty;
using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface ISpecialtyService
    {
        public Task AddSpecialtyAsync(AddSpecialtyDto dto);
        public Task UpdateSpecialtyAsync(UpdateSpecialtyDto dto);
        public Task DeleteSpecialtyAsync(int id);
        public Task<IEnumerable<Specialty>> GetAllSpecialtyAsync();

    }
}

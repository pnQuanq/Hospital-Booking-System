using Docmate.Core.Contracts.Specialty;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Infrastructure.Persistence.Repositories;

namespace Docmate.Core.Services.Features
{
    public class SpecialtyService : ISpecialtyService
    {
        private readonly ISpecialtyRepository _specialtyRepository;

        public SpecialtyService(ISpecialtyRepository repository)
        {
            _specialtyRepository = repository;
        }
        public async Task AddSpecialtyAsync(AddSpecialtyDto dto)
        {
            var specialty = new Specialty
            {
                Description = dto.Description
            };

            await _specialtyRepository.AddAsync(specialty);
        }
        public async Task UpdateSpecialtyAsync(UpdateSpecialtyDto dto)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(dto.Id);
            if (specialty == null) throw new Exception("Specialty not found");

            specialty.Description = dto.Description;

            await _specialtyRepository.UpdateAsync(specialty);

        }

        public async Task DeleteSpecialtyAsync(int id)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(id);
            if (specialty == null) throw new Exception("Specialty not found");

            await _specialtyRepository.DeleteAsync(specialty.SpecialtyId);

        }
        public async Task<IEnumerable<Specialty>> GetAllSpecialtyAsync()
        {
            var specialties = await _specialtyRepository.GetAllAsync();
            if (specialties == null) throw new Exception("Specialties not found");

            return specialties;
        }

    }
}

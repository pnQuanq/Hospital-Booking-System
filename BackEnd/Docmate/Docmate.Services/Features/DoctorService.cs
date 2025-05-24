
using Docmate.Core.Contracts.Doctor;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;

namespace Docmate.Core.Services.Features
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        public DoctorService(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }
        public async Task AddDoctorAsync(AddDoctorDto dto)
        {
            var doctor = new Doctor
            {
                User = new ApplicationUser
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    PasswordHash = dto.Password,
                    ImageUrl = dto.ImagePath ?? ""
                },
                ExperienceYears = dto.Experience,
                SpecialtyId = dto.SpecialtyId,
                Description = dto.Description,
                Rating = 0
            };

            await _doctorRepository.AddAsync(doctor);
        }


    }
}

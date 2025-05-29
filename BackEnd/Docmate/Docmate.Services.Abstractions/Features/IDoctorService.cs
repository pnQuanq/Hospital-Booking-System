
using Docmate.Core.Contracts.Doctor;
using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IDoctorService
    {
        Task AddDoctorAsync(AddDoctorDto dto);
        Task<List<DoctorDto>> GetAllDoctorsAsync();
        Task<bool> UpdateDoctorAsync(UpdateDoctorDto dto);
        Task<List<DoctorDto>> GetTopDoctorsAsync();
        Task<DoctorDto?> GetDoctorDetailsAsync(int userId);

    }
}

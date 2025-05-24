
using Docmate.Core.Contracts.Doctor;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IDoctorService
    {
        Task AddDoctorAsync(AddDoctorDto dto);
    }
}

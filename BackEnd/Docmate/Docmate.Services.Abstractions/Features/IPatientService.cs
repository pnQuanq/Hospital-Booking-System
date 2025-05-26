using Docmate.Core.Contracts.Patient;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IPatientService
    {
        Task<bool> UpdatePatientProfileAsync(int userId, UpdatePatientDto dto);
        Task<PatientDto?> GetPatientDetailsAsync(int userId);
    }
}

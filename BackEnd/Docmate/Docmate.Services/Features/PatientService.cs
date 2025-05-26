using Docmate.Core.Contracts.Patient;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;

namespace Docmate.Core.Services.Features
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;

        public PatientService(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository;
        }
        public async Task<bool> UpdatePatientProfileAsync(int userId, UpdatePatientDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null) return false;

            patient.User.FullName = dto.FullName;
            patient.User.ImageUrl = dto.ImageUrl;
            patient.Gender = dto.Gender;
            patient.DateOfBirth = dto.DateOfBirth;
            patient.Weight = dto.Weight;
            patient.Height = dto.Height;
            patient.Allergy = dto.Allergy;

            await _patientRepository.UpdateAsync(patient);
            return true;
        }
        public async Task<PatientDto?> GetPatientDetailsAsync(int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null) return null;

            return new PatientDto
            {
                FullName = patient.User.FullName,
                ImageUrl = patient.User.ImageUrl,
                Gender = patient.Gender,
                DateOfBirth = patient.DateOfBirth,
                Weight = patient.Weight,
                Height = patient.Height,
                Allergy = patient.Allergy,
                Email = patient.User.Email
            };
        }
    }
}

﻿using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<Patient> GetByUserIdAsync(int userId);
        Task<List<Patient>> GetPatientsByDoctorIdAsync(int doctorId);
        public DateTime? CalculateLastVisit(Patient patient);
    }
}

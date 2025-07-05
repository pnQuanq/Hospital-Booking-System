using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<List<Payment>> GetByPatientIdAsync(int patientId);
        Task<List<Payment>> GetByAppointmentIdAsync(int appointmentId);
    }
}

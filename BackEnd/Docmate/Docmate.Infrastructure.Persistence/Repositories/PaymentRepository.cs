using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        public PaymentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<List<Payment>> GetByAppointmentIdAsync(int appointmentId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Payment>> GetByPatientIdAsync(int patientId)
        {
            throw new NotImplementedException();
        }
    }
}

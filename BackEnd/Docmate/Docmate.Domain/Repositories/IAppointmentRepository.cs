using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IAppointmentRepository : IGenericRepository<Appointment>
    {
        Task<List<Appointment>> GetAppointmentsByPatientIdAsync(int patientId);
        Task<List<Appointment>> GetAppointmentsByDoctorIdAsync(int docId);
        Task<Appointment> GetByIdWithDetailsAsync(int appointmentId);
        Task<List<Appointment>> GetAllAppointmentsWithDetailsAsync();
    }
}

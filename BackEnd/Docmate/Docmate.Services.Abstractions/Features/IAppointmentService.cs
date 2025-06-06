using Docmate.Core.Contracts.Appointment;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IAppointmentService
    {
        Task CreateAppointmentByUserIdAsync(int userId, int doctorId, DateTime date, string time);
        Task<List<AppointmentDto>> GetAppointmentsByPatientIdAsync(int patientId);
        Task<bool> UpdateStatusAsync(UpdateAppointmentDto dto);
    }
}

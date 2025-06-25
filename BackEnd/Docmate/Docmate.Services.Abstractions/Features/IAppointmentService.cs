using Docmate.Core.Contracts.Appointment;
using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IAppointmentService
    {
        Task CreateAppointmentByUserIdAsync(int userId, int doctorId, DateTime date, string time);
        Task<List<AppointmentDto>> GetAppointmentsByPatientIdAsync(int patientId);
        Task<List<AppointmentDto>> GetAppointmentsByDoctorIdAsync(int docId);
        Task<bool> UpdateStatusAsync(UpdateAppointmentDto dto);
        Task<List<TimeSlot>> GetDoctorConfirmedSlotsAsync(int doctorId);
        Task<List<TimeSlot>> GetDoctorReservedSlotsAsync(int doctorId);
        Task<List<AdminAppointmentDto>> GetAllAppointmentsForAdminAsync();
    }
}

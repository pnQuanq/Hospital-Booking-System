using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IEmailTemplateService
    {
        string GenerateAppointmentStatusChangeEmailForPatient(Appointment appointment, AppointmentStatus previousStatus);
        string GenerateAppointmentStatusChangeEmailForDoctor(Appointment appointment, AppointmentStatus previousStatus);
        string GetSubjectForStatusChange(AppointmentStatus newStatus, AppointmentStatus previousStatus);
    }
}

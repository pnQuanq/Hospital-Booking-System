using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Services.Abstractions.Observer;
using Microsoft.Extensions.Logging;

namespace Docmate.Core.Services.Observer
{
    public class PatientEmailObserver : IAppointmentObserver
    {
        private readonly IEmailService _emailService;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly ILogger<PatientEmailObserver> _logger;

        public PatientEmailObserver(
            IEmailService emailService,
            IEmailTemplateService emailTemplateService,
            ILogger<PatientEmailObserver> logger)
        {
            _emailService = emailService;
            _emailTemplateService = emailTemplateService;
            _logger = logger;
        }

        public async Task NotifyAsync(Appointment appointment, AppointmentStatus previousStatus)
        {
            try
            {
                var patientEmail = appointment.Patient.User.Email;
                if (string.IsNullOrEmpty(patientEmail))
                {
                    _logger.LogWarning("Patient email is empty for appointment {AppointmentId}", appointment.AppointmentId);
                    return;
                }

                var subject = _emailTemplateService.GetSubjectForStatusChange(appointment.Status, previousStatus);
                var emailBody = _emailTemplateService.GenerateAppointmentStatusChangeEmailForPatient(appointment, previousStatus);

                await _emailService.SendEmailAsync(patientEmail, subject, emailBody);

                _logger.LogInformation("Email notification sent to patient {PatientEmail} for appointment {AppointmentId} status change",
                    patientEmail, appointment.AppointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email notification to patient for appointment {AppointmentId}",
                    appointment.AppointmentId);
                // Don't throw - we don't want email failures to break the appointment update
            }
        }
    }
}

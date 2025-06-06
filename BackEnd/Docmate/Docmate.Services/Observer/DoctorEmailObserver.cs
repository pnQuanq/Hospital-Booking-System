using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Services.Abstractions.Observer;
using Microsoft.Extensions.Logging;

namespace Docmate.Core.Services.Observer
{
    public class DoctorEmailObserver : IAppointmentObserver
    {
        private readonly IEmailService _emailService;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly ILogger<DoctorEmailObserver> _logger;

        public DoctorEmailObserver(
            IEmailService emailService,
            IEmailTemplateService emailTemplateService,
            ILogger<DoctorEmailObserver> logger)
        {
            _emailService = emailService;
            _emailTemplateService = emailTemplateService;
            _logger = logger;
        }

        public async Task NotifyAsync(Appointment appointment, AppointmentStatus previousStatus)
        {
            try
            {
                var doctorEmail = appointment.Doctor.User.Email;
                if (string.IsNullOrEmpty(doctorEmail))
                {
                    _logger.LogWarning("Doctor email is empty for appointment {AppointmentId}", appointment.AppointmentId);
                    return;
                }

                var subject = _emailTemplateService.GetSubjectForStatusChange(appointment.Status, previousStatus);
                var emailBody = _emailTemplateService.GenerateAppointmentStatusChangeEmailForDoctor(appointment, previousStatus);

                await _emailService.SendEmailAsync(doctorEmail, subject, emailBody);

                _logger.LogInformation("Email notification sent to doctor {DoctorEmail} for appointment {AppointmentId} status change",
                    doctorEmail, appointment.AppointmentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email notification to doctor for appointment {AppointmentId}",
                    appointment.AppointmentId);
            }
        }
    }
}

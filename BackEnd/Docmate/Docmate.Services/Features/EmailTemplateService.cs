using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;

namespace Docmate.Core.Services.Features
{
    public class EmailTemplateService : IEmailTemplateService
    {
        public string GenerateAppointmentStatusChangeEmailForPatient(Appointment appointment, AppointmentStatus previousStatus)
        {
            var statusMessage = GetStatusMessage(appointment.Status, previousStatus, isForPatient: true);

            return $@"
                <html>
                <body>
                    <h2>Appointment Status Update</h2>
                    <p>Dear {appointment.Patient.User.FullName},</p>
                    
                    <p>{statusMessage}</p>
                    
                    <h3>Appointment Details:</h3>
                    <ul>
                        <li><strong>Doctor:</strong> Dr. {appointment.Doctor.User.FullName}</li>
                        <li><strong>Specialty:</strong> {appointment.Doctor.Specialty.Description}</li>
                        <li><strong>Date & Time:</strong> {appointment.Date:dddd, MMMM dd, yyyy 'at' h:mm tt}</li>
                        <li><strong>Status:</strong> {appointment.Status}</li>
                    </ul>
                    
                    {GetAdditionalPatientMessage(appointment.Status)}
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br/>
                    Docmate Team</p>
                </body>
                </html>";
        }

        public string GenerateAppointmentStatusChangeEmailForDoctor(Appointment appointment, AppointmentStatus previousStatus)
        {
            var statusMessage = GetStatusMessage(appointment.Status, previousStatus, isForPatient: false);

            return $@"
                <html>
                <body>
                    <h2>Appointment Status Update</h2>
                    <p>Dear Dr. {appointment.Doctor.User.FullName},</p>
                    
                    <p>{statusMessage}</p>
                    
                    <h3>Appointment Details:</h3>
                    <ul>
                        <li><strong>Patient:</strong> {appointment.Patient.User.FullName}</li>
                        <li><strong>Date & Time:</strong> {appointment.Date:dddd, MMMM dd, yyyy 'at' h:mm tt}</li>
                        <li><strong>Status:</strong> {appointment.Status}</li>
                    </ul>
                    
                    {GetAdditionalDoctorMessage(appointment.Status)}
                    
                    <p>Best regards,<br/>
                    Docmate Team</p>
                </body>
                </html>";
        }

        public string GetSubjectForStatusChange(AppointmentStatus newStatus, AppointmentStatus previousStatus)
        {
            return newStatus switch
            {
                AppointmentStatus.Scheduled => "Appointment Scheduled",
                AppointmentStatus.Completed => "Appointment Completed",
                AppointmentStatus.Cancelled => "Appointment Cancelled",
                _ => "Appointment Status Updated"
            };
        }

        private string GetStatusMessage(AppointmentStatus newStatus, AppointmentStatus previousStatus, bool isForPatient)
        {
            var subject = isForPatient ? "your" : "the";

            return newStatus switch
            {
                AppointmentStatus.Scheduled => $"We're pleased to confirm that {subject} appointment has been scheduled.",
                AppointmentStatus.Completed => $"Your appointment has been marked as completed. Thank you for choosing our services.",
                AppointmentStatus.Cancelled => $"We regret to inform you that {subject} appointment has been cancelled.",
                _ => $"The status of {subject} appointment has been updated to {newStatus}."
            };
        }

        private string GetAdditionalPatientMessage(AppointmentStatus status)
        {
            return status switch
            {
                AppointmentStatus.Scheduled => "<p><em>Please arrive 15 minutes before your scheduled time.</em></p>",
                AppointmentStatus.Completed => "<p><em>We hope you had a great experience. Please consider leaving a review.</em></p>",
                AppointmentStatus.Cancelled => "<p><em>If you need to reschedule, please contact us or book a new appointment through our platform.</em></p>",
                _ => ""
            };
        }

        private string GetAdditionalDoctorMessage(AppointmentStatus status)
        {
            return status switch
            {
                AppointmentStatus.Scheduled => "<p><em>Please prepare for the upcoming appointment.</em></p>",
                AppointmentStatus.Completed => "<p><em>Thank you for providing excellent care to our patients.</em></p>",
                AppointmentStatus.Cancelled => "<p><em>Your schedule has been updated accordingly.</em></p>",
                _ => ""
            };
        }
    }
}

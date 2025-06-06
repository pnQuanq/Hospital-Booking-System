using Docmate.Core.Contracts.Appointment;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using System.Globalization;

namespace Docmate.Core.Services.Features
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;

        public AppointmentService(IAppointmentRepository appointmentRepository,
                                IPatientRepository patientRepository,
                                IDoctorRepository doctorRepository)
        {
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
        }
        public async Task CreateAppointmentByUserIdAsync(int userId, int doctorId, DateTime date, string time)
        {
            try
            {
                // Look up the patient by UserId
                var patient = await _patientRepository.GetByUserIdAsync(userId);
                if (patient == null)
                {
                    throw new ArgumentException($"No patient found for User ID {userId}");
                }

                // Parse the time string
                TimeSpan timeSpan = ParseTimeString(time);

                // Validate that the doctor exists
                var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(doctorId);
                if (doctor == null)
                {
                    throw new ArgumentException($"Doctor with ID {doctorId} does not exist");
                }

                var appointment = new Appointment
                {
                    PatientId = patient.PatientId, // Use the actual PatientId
                    DoctorId = doctorId,
                    Date = date.Date.Add(timeSpan),
                    Status = AppointmentStatus.Scheduled
                };

                await _appointmentRepository.AddAsync(appointment);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create appointment: {ex.Message}", ex);
            }
        }

        private async Task ValidatePatientAndDoctorExist(int patientId, int doctorId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientId);
            if (patient == null)
                throw new ArgumentException($"Patient with ID {patientId} does not exist");

            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(doctorId);
            if (doctor == null)
                throw new ArgumentException($"Doctor with ID {doctorId} does not exist");
        }

        private TimeSpan ParseTimeString(string timeString)
        {
            try
            {
                // Handle formats like "7:00am", "1:30pm", etc.
                if (DateTime.TryParseExact(timeString, new[] { "h:mmtt", "hh:mmtt", "h:mm tt", "hh:mm tt" },
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedTime))
                {
                    return parsedTime.TimeOfDay;
                }

                // Fallback: try to parse as TimeSpan directly
                if (TimeSpan.TryParse(timeString, out TimeSpan directTimeSpan))
                {
                    return directTimeSpan;
                }

                throw new FormatException($"Unable to parse time string: {timeString}");
            }
            catch (Exception ex)
            {
                throw new FormatException($"Invalid time format: {timeString}. Expected format like '7:00am' or '1:30pm'", ex);
            }
        }
        public async Task<List<AppointmentDto>> GetAppointmentsByPatientIdAsync(int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            if (patient == null)
            {
                throw new ArgumentException($"No patient found for User ID {userId}");
            }

            var appointments = await _appointmentRepository.GetAppointmentsByPatientIdAsync(patient.PatientId);

            return appointments.Select(a => new AppointmentDto
            {
                AppointmentId = a.AppointmentId,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.User.FullName,
                DoctorImageUrl = a.Doctor.User.ImageUrl,
                Specialty = a.Doctor.Specialty.Description,
                Date = a.Date,
                Status = a.Status.ToString()
            }).ToList();
        }
        public async Task<bool> UpdateStatusAsync(UpdateAppointmentDto dto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null) return false;

            if (!Enum.TryParse<AppointmentStatus>(dto.NewStatus, out var status))
                return false;

            appointment.Status = status;
            await _appointmentRepository.UpdateAsync(appointment);

            return true;
        }
    }
}
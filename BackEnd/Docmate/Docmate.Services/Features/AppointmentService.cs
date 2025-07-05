using Docmate.Core.Contracts.Appointment;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Services.Abstractions.Observer;
using System.Globalization;

namespace Docmate.Core.Services.Features
{
    public class AppointmentService : IAppointmentService, IAppointmentSubject
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly List<IAppointmentObserver> _observers;
        private readonly ITimeSlotRepository _timeSlotRepository;

        public AppointmentService(IAppointmentRepository appointmentRepository,
                                IPatientRepository patientRepository,
                                IDoctorRepository doctorRepository,     
                                ITimeSlotRepository timeSlotRepository)
        {
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _observers = new List<IAppointmentObserver>();
            _timeSlotRepository = timeSlotRepository;
        }

        public void Subscribe(IAppointmentObserver observer)
        {
            _observers.Add(observer);
        }

        public void Unsubscribe(IAppointmentObserver observer)
        {
            _observers.Remove(observer);
        }

        public async Task NotifyObserversAsync(Appointment appointment, AppointmentStatus previousStatus)
        {
            var tasks = _observers.Select(observer => observer.NotifyAsync(appointment, previousStatus));
            await Task.WhenAll(tasks);
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
                DateTime appointmentDateTime = date.Date.Add(timeSpan);

                // Validate that the appointment is in the future
                if (appointmentDateTime <= DateTime.Now)
                {
                    throw new InvalidOperationException("Appointment must be scheduled for a future date and time");
                }

                // Validate that the doctor exists
                var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(doctorId);
                if (doctor == null)
                {
                    throw new ArgumentException($"Doctor with ID {doctorId} does not exist");
                }

                // Check if doctor is available
                if (!doctor.IsAvailable)
                {
                    throw new InvalidOperationException("Doctor is currently not available for appointments");
                }

                // Check if TimeSlot exists, if not create it
                var timeSlot = await _timeSlotRepository.GetByDoctorAndTimeAsync(doctorId, appointmentDateTime);
                if (timeSlot == null)
                {
                    // Create new TimeSlot and mark as reserved
                    timeSlot = new TimeSlot
                    {
                        DoctorId = doctorId,
                        Time = appointmentDateTime,
                        Status = TimeSlotStatus.Reserved // Mark as reserved when appointment is created
                    };

                    await _timeSlotRepository.AddAsync(timeSlot);
                }
                else
                {
                    // Check if slot is available
                    if (timeSlot.Status != TimeSlotStatus.Free)
                    {
                        string statusText = GetTimeSlotStatusText(timeSlot.Status);
                        throw new InvalidOperationException($"Time slot at {appointmentDateTime:yyyy-MM-dd HH:mm} is {statusText}");
                    }

                    // Update existing slot to Reserved
                    timeSlot.Status = TimeSlotStatus.Reserved;
                    await _timeSlotRepository.UpdateAsync(timeSlot);
                }

                // Create the appointment with Pending status initially
                var appointment = new Appointment
                {
                    PatientId = patient.PatientId,
                    DoctorId = doctorId,
                    Date = appointmentDateTime,
                    Status = AppointmentStatus.Pending, // Start with Pending status
                };

                await _appointmentRepository.AddAsync(appointment);

                // Load the full appointment with related data for notifications
                var fullAppointment = await _appointmentRepository.GetByIdWithDetailsAsync(appointment.AppointmentId);
                if (fullAppointment != null)
                {
                    // Notify observers about the new appointment
                    await NotifyObserversAsync(fullAppointment, AppointmentStatus.Pending);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create appointment: {ex.Message}", ex);
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
                IsReviewed = a.IsReviewed,
                Status = a.Status.ToString()
            }).ToList();
        }
        public async Task<List<AppointmentDto>> GetAppointmentsByDoctorIdAsync(int userId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            if (doctor == null)
            {
                throw new ArgumentException($"No doctor found for User ID {userId}");
            }

            var appointments = await _appointmentRepository.GetAppointmentsByDoctorIdAsync(doctor.DoctorId);

            return appointments.Select(a => new AppointmentDto
            {
                AppointmentId = a.AppointmentId,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.User.FullName,
                DoctorImageUrl = a.Doctor.User.ImageUrl,
                Specialty = a.Doctor.Specialty.Description,
                Rating = a.Doctor.Rating,

                PatientId = a.PatientId,
                PatientImageUrl = a.Patient.User.ImageUrl,
                PatientGender = a.Patient.Gender,
                PatientName = a.Patient.User.FullName,
                PatientAllergy = a.Patient.Allergy,
                PatientDateOfBirth = a.Patient.DateOfBirth,
                PatientHeight = a.Patient.Height,
                PatientWeight = a.Patient.Weight,
                Date = a.Date,
                DateString = a.Date.ToString("yyyy-MM-dd"),
                TimeString = a.Date.ToString("HH:mm"),
                Status = a.Status.ToString()
            }).ToList();
        }
        public async Task<List<AppointmentDto>> GetBookedAppointmentAsync(int userId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            if (doctor == null)
            {
                throw new ArgumentException($"No doctor found for User ID {userId}");
            }

            var appointments = await _appointmentRepository.GetAppointmentsByDoctorIdAsync(doctor.DoctorId);

            return appointments
                .Where(a => a.Status.ToString() == "Scheduled" || a.Status.ToString() == "Completed")
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.User.FullName,
                    DoctorImageUrl = a.Doctor.User.ImageUrl,
                    Specialty = a.Doctor.Specialty.Description,
                    PatientId = a.PatientId,
                    PatientImageUrl = a.Patient.User.ImageUrl,
                    PatientGender = a.Patient.Gender,
                    PatientName = a.Patient.User.FullName,
                    PatientAllergy = a.Patient.Allergy,
                    PatientDateOfBirth = a.Patient.DateOfBirth,
                    PatientHeight = a.Patient.Height,
                    PatientWeight = a.Patient.Weight,
                    Date = a.Date,
                    DateString = a.Date.ToString("yyyy-MM-dd"),
                    TimeString = a.Date.ToString("HH:mm"),
                    Status = a.Status.ToString()
                }).ToList();
        }
        public async Task<bool> UpdateStatusAsync(UpdateAppointmentDto dto)
        {
            // Get the appointment with full details including Patient and Doctor
            var appointment = await _appointmentRepository.GetByIdWithDetailsAsync(dto.AppointmentId);
            if (appointment == null) return false;

            if (!Enum.TryParse<AppointmentStatus>(dto.NewStatus, out var newStatus))
                return false;

            var previousStatus = appointment.Status;

            // Only proceed if status actually changed
            if (previousStatus != newStatus)
            {
                // Update appointment status
                appointment.Status = newStatus;
                await _appointmentRepository.UpdateAsync(appointment);

                // Update corresponding TimeSlot status based on appointment status
                await UpdateTimeSlotStatusBasedOnAppointment(appointment, newStatus, previousStatus);

                // Notify observers about the status change
                await NotifyObserversAsync(appointment, previousStatus);
            }

            return true;
        }

        private async Task UpdateTimeSlotStatusBasedOnAppointment(Appointment appointment, AppointmentStatus newStatus, AppointmentStatus previousStatus)
        {
            var timeSlot = await _timeSlotRepository.GetByDoctorAndTimeAsync(appointment.DoctorId, appointment.Date);
            if (timeSlot == null) return;

            TimeSlotStatus newTimeSlotStatus = newStatus switch
            {
                AppointmentStatus.Pending => TimeSlotStatus.Reserved,
                AppointmentStatus.Scheduled => TimeSlotStatus.Confirmed,
                AppointmentStatus.Completed => TimeSlotStatus.Free,
                AppointmentStatus.Cancelled => TimeSlotStatus.Free,
                _ => timeSlot.Status
            };

            if (timeSlot.Status != newTimeSlotStatus)
            {
                timeSlot.Status = newTimeSlotStatus;
                await _timeSlotRepository.UpdateAsync(timeSlot);
            }
        }
        public async Task UpdateAppointmentReviewAsync(int appointmentId)
        {
            var a = await _appointmentRepository.GetByIdAsync(appointmentId);
            a.IsReviewed = true;
            await _appointmentRepository.UpdateAsync(a);
        }
        public async Task<List<AdminAppointmentDto>> GetAllAppointmentsForAdminAsync()
        {
            try
            {
                var appointments = await _appointmentRepository.GetAllAppointmentsWithDetailsAsync();

                return appointments.Select(a => new AdminAppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    PatientFullName = a.Patient.User.FullName,
                    PatientImageUrl = a.Patient.User.ImageUrl,
                    PatientDob = a.Patient.DateOfBirth ?? DateTime.MinValue,
                    PatientEmail = a.Patient.User.Email,
                    PatientPhone = a.Patient.User.PhoneNumber,

                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.User.FullName,
                    DoctorImageUrl = a.Doctor.User.ImageUrl,
                    Specialty = a.Doctor.Specialty.Description,

                    Date = a.Date,
                    SlotDate = a.Date.ToString("dd MMM yyyy"),
                    SlotTime = a.Date.ToString("hh:mm tt"),
                    Status = a.Status.ToString(),

                }).OrderByDescending(x => x.Date).ToList();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to retrieve appointments: {ex.Message}", ex);
            }
        }
        public async Task<List<TimeSlot>> GetDoctorReservedSlotsAsync(int doctorId)
        {

            return await _timeSlotRepository.GetDoctorReservedSlotsAsync(doctorId);
        }
        public async Task<List<TimeSlot>> GetDoctorConfirmedSlotsAsync(int doctorId)
        {
            return await _timeSlotRepository.GetDoctorConfirmedSlotsAsync(doctorId);
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
        private string GetTimeSlotStatusText(TimeSlotStatus status)
        {
            return status switch
            {
                TimeSlotStatus.Free => "currently free",
                TimeSlotStatus.Reserved => "already reserved",
                TimeSlotStatus.Confirmed => "already confirmed",
                _ => "in an unknown state"
            };
        }
    }
}
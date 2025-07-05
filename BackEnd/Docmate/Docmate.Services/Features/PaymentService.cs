using Docmate.Core.Contracts.Appointment;
using Docmate.Core.Contracts.Payment;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.EntityFrameworkCore.Update.Internal;

namespace Docmate.Core.Services.Features
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IAppointmentService _appointmentService;

        public PaymentService(IPaymentRepository paymentRepository,
                             IAppointmentRepository appointmentRepository,
                             IPatientRepository patientRepository,
                             IDoctorRepository doctorRepository,
                             IAppointmentService appointmentService)
        {
            _paymentRepository = paymentRepository;
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _appointmentService = appointmentService;
        }

        public async Task<PaymentResponseDto> ProcessBankTransferAsync(BankTransferPaymentDto dto)
        {
            try
            {
                // Validate appointment exists and belongs to patient
                var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
                if (appointment == null)
                {
                    return new PaymentResponseDto
                    {
                        Success = false,
                        Message = "Appointment not found"
                    };
                }

                // Validate patient
                var patient = await _patientRepository.GetByIdAsync(dto.PatientUserId);
                if (patient == null)
                {
                    return new PaymentResponseDto
                    {
                        Success = false,
                        Message = "Patient not found"
                    };
                }

                // Check if appointment is in pending status
                if (appointment.Status.ToString() != "Pending")
                {
                    return new PaymentResponseDto
                    {
                        Success = false,
                        Message = "Payment can only be made for pending appointments"
                    };
                }

                var payment = new Payment
                {
                    AppointmentId = dto.AppointmentId,
                    PatientId = patient.PatientId,
                    Amount = dto.Amount,
                    PaymentMethod = "Bank Transfer",
                    Status = "Completed",

                };

                await _paymentRepository.AddAsync(payment);

                var updateAppointmentDto = new UpdateAppointmentDto
                {
                    AppointmentId = appointment.AppointmentId,
                    NewStatus = "Scheduled"
                };
                await _appointmentService.UpdateStatusAsync(updateAppointmentDto);

                await _appointmentRepository.UpdateAsync(appointment);

                return new PaymentResponseDto
                {
                    Success = true,
                    Message = "Bank transfer payment completed successfully",
                    PaymentId = payment.PaymentId
                };
            }
            catch (Exception ex)
            {
                return new PaymentResponseDto
                {
                    Success = false,
                    Message = "An error occurred while processing the payment"
                };
            }
        }

        public async Task<List<PaymentDto>> GetPaymentsByPatientAsync(int patientUserId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(patientUserId);
            if (patient == null)
                throw new InvalidOperationException("Patient not found.");

            var payments = await _paymentRepository.GetByPatientIdAsync(patient.PatientId);

            return payments.Select(p => new PaymentDto
            {
                PaymentId = p.PaymentId,
                AppointmentId = p.AppointmentId,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
            }).ToList();
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(int paymentId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);
            if (payment == null) return null;

            return new PaymentDto
            {
                PaymentId = payment.PaymentId,
                AppointmentId = payment.AppointmentId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                Status = payment.Status,
            };
        }
        public async Task<PaymentInfoDto?> ShowPaymentInfoAsync(int appointmentId)
        {
            var appointment = await _appointmentRepository.GetByIdWithDetailsAsync(appointmentId);
            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(appointment.DoctorId);

            return new PaymentInfoDto
            {
                DoctorName = doctor.User.FullName,
                DoctorSpecialty = doctor.Specialty.Description,
                Fee = doctor.Specialty.Fee,
                Date = appointment.Date.ToString("dd-MM-yyyy"),
                Time = appointment.Date.ToString("HH:mm"),
            };
        }
    }
}
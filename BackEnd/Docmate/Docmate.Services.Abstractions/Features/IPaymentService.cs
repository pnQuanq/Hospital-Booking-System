using Docmate.Core.Contracts.Payment;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> ProcessBankTransferAsync(BankTransferPaymentDto dto);
        Task<List<PaymentDto>> GetPaymentsByPatientAsync(int patientUserId);
        Task<PaymentDto?> GetPaymentByIdAsync(int paymentId);
        Task<PaymentInfoDto> ShowPaymentInfoAsync(int appointmentId);
    }
}

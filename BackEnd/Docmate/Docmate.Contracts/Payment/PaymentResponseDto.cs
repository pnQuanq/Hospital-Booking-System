namespace Docmate.Core.Contracts.Payment
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string TransactionReference { get; set; } = string.Empty;
        public int PaymentId { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }
}

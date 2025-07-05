namespace Docmate.Core.Contracts.Payment
{
    public class BankTransferPaymentDto
    {
        public int AppointmentId { get; set; }
        public int PatientUserId { get; set; }
        public double Amount { get; set; }
    }
}

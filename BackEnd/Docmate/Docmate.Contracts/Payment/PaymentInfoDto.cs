namespace Docmate.Core.Contracts.Payment
{
    public class PaymentInfoDto
    {
        public string DoctorName { get; set; }
        public string DoctorSpecialty {  get; set; }
        public string Date {  get; set; }
        public string Time { get; set; }
        public double Fee { get; set; }
    }
}

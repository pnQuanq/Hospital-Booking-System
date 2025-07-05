using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docmate.Core.Contracts.Payment
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int AppointmentId { get; set; }
        public double Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}

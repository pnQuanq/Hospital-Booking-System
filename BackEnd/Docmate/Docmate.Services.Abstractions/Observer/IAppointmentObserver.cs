using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Observer
{
    public interface IAppointmentObserver
    {
        Task NotifyAsync(Appointment appointment, AppointmentStatus previousStatus);
    }
}

using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Observer
{
    public interface IAppointmentSubject
    {
        void Subscribe(IAppointmentObserver observer);
        void Unsubscribe(IAppointmentObserver observer);
        Task NotifyObserversAsync(Appointment appointment, AppointmentStatus previousStatus);
    }
}

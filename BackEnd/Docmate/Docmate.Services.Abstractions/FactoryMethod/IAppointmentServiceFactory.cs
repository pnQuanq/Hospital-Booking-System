using Docmate.Core.Services.Abstractions.Features;

namespace Docmate.Core.Services.Abstractions.FactoryMethod
{
    public interface IAppointmentServiceFactory
    {
        IAppointmentService CreateAppointmentService();
    }
}

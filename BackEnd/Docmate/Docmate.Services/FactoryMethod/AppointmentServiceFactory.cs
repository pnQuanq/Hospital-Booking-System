using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.FactoryMethod;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Services.Features;
using Docmate.Core.Services.Observer;
using Microsoft.Extensions.DependencyInjection;

namespace Docmate.Core.Services.FactoryMethod
{
    public class AppointmentServiceFactory : IAppointmentServiceFactory
    {
        private readonly IServiceProvider _serviceProvider;

        public AppointmentServiceFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public IAppointmentService CreateAppointmentService()
        {
            var appointmentRepo = _serviceProvider.GetRequiredService<IAppointmentRepository>();
            var patientRepo = _serviceProvider.GetRequiredService<IPatientRepository>();
            var doctorRepo = _serviceProvider.GetRequiredService<IDoctorRepository>();

            var appointmentService = new AppointmentService(appointmentRepo, patientRepo, doctorRepo);

            // Subscribe all observers
            var patientObserver = _serviceProvider.GetRequiredService<PatientEmailObserver>();
            var doctorObserver = _serviceProvider.GetRequiredService<DoctorEmailObserver>();

            appointmentService.Subscribe(patientObserver);
            appointmentService.Subscribe(doctorObserver);

            return appointmentService;
        }
    }
}

using Docmate.Core.Services.Abstractions.FactoryMethod;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Services.FactoryMethod;
using Docmate.Core.Services.Features;
using Docmate.Core.Services.Mapper;
using Docmate.Core.Services.Observer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Docmate.Core.Services
{
    public static class ApplicationServicesRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAutoMapper(typeof(MappingProfile));
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IDoctorService, DoctorService>();
            services.AddScoped<ISpecialtyService, SpecialtyService>();
            services.AddScoped<IPatientService, PatientService>();
            services.AddScoped<IChatbotService, ChatbotService>();
            services.AddHttpClient<IOpenAIService, OpenAIService>();
            //services.AddScoped<IAppointmentService, AppointmentService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();

            // Observers
            services.AddScoped<PatientEmailObserver>();
            services.AddScoped<DoctorEmailObserver>();

            //factory
            services.AddScoped<IAppointmentServiceFactory, AppointmentServiceFactory>();
            services.AddScoped<IAppointmentService>(provider =>
            {
                var factory = provider.GetRequiredService<IAppointmentServiceFactory>();
                return factory.CreateAppointmentService();
            });
            return services;
        }
    }
}

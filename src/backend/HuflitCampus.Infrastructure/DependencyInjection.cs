using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Interfaces.Repositories;
using HuflitCampus.Infrastructure.Ask;
using HuflitCampus.Infrastructure.Auth;
using HuflitCampus.Infrastructure.Identity;
using HuflitCampus.Infrastructure.Notifications;
using HuflitCampus.Infrastructure.Options;
using HuflitCampus.Infrastructure.Persistence;
using HuflitCampus.Infrastructure.Persistence.Repositories;
using HuflitCampus.Infrastructure.Storage;
using HuflitCampus.Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HuflitCampus.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<BlobStorageOptions>(configuration.GetSection(BlobStorageOptions.SectionName));
        services.Configure<FcmOptions>(configuration.GetSection(FcmOptions.SectionName));
        services.Configure<EntraIdOptions>(configuration.GetSection(EntraIdOptions.SectionName));
        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));
        services.Configure<AuthOptions>(configuration.GetSection(AuthOptions.SectionName));
        services.Configure<AskRagOptions>(configuration.GetSection(AskRagOptions.SectionName));

        var askOptions = configuration.GetSection(AskRagOptions.SectionName).Get<AskRagOptions>()
                         ?? new AskRagOptions();
        services.AddHttpClient<IAskRagClient, AskRagClient>(client =>
        {
            var baseUrl = string.IsNullOrWhiteSpace(askOptions.BaseUrl)
                ? "http://localhost:8000"
                : askOptions.BaseUrl.TrimEnd('/');
            client.BaseAddress = new Uri(baseUrl + "/");
            client.Timeout = TimeSpan.FromSeconds(askOptions.TimeoutSeconds <= 0 ? 60 : askOptions.TimeoutSeconds);
        });
        services.AddSingleton<IAskRoutingSettings, AskRoutingSettings>();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IRegistrationRepository, RegistrationRepository>();
        services.AddScoped<IAttendanceRepository, AttendanceRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<ISavedEventRepository, SavedEventRepository>();
        services.AddScoped<IQrTokenRepository, QrTokenRepository>();
        services.AddScoped<IAnnouncementRepository, AnnouncementRepository>();
        services.AddScoped<IOtpChallengeRepository, OtpChallengeRepository>();

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IMicrosoftIdTokenValidator, MicrosoftIdTokenValidator>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IOtpService, OtpService>();
        services.AddScoped<IEmailSender, EmailSender>();
        services.AddScoped<IFcmService, FcmService>();

        var blobOptions = configuration.GetSection(BlobStorageOptions.SectionName).Get<BlobStorageOptions>()
                          ?? new BlobStorageOptions();

        if (blobOptions.IsAzureConfigured)
            services.AddScoped<IBlobStorageService, AzureBlobStorageService>();
        else
            services.AddScoped<IBlobStorageService, LocalFileStorageService>();

        services.AddSignalR();
        services.AddScoped<INotificationPublisher, SignalRNotificationPublisher>();

        services.AddHostedService<HuflitCampus.Infrastructure.BackgroundJobs.EventLifecycleWorker>();

        services.AddHuflitAuthentication(configuration);

        return services;
    }
}

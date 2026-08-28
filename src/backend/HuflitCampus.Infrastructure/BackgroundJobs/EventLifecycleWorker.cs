using HuflitCampus.Domain.Enums;
using HuflitCampus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HuflitCampus.Infrastructure.BackgroundJobs;

public class EventLifecycleWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EventLifecycleWorker> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(2);

    public EventLifecycleWorker(
        IServiceProvider serviceProvider,
        ILogger<EventLifecycleWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EventLifecycleWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessEventStatusTransitionsAsync(stoppingToken);
                await CleanupExpiredTokensAsync(stoppingToken);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error occurred during EventLifecycleWorker execution.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("EventLifecycleWorker stopped.");
    }

    private async Task ProcessEventStatusTransitionsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var now = DateTime.UtcNow;

        // 1. Auto-complete events whose EndAt has passed
        var expiredActiveEvents = await context.Events
            .Where(e => !e.IsDeleted
                        && (e.Status == EventStatus.Published || e.Status == EventStatus.RegistrationClosed)
                        && e.EndAt < now)
            .ToListAsync(cancellationToken);

        if (expiredActiveEvents.Count > 0)
        {
            foreach (var ev in expiredActiveEvents)
            {
                ev.Status = EventStatus.Completed;
                ev.UpdatedAt = now;
                _logger.LogInformation("Auto-completed event: {EventTitle} (Id: {EventId})", ev.Title, ev.Id);
            }
        }

        // 2. Auto-close registration for events whose RegistrationDeadline has passed
        var pastDeadlineEvents = await context.Events
            .Where(e => !e.IsDeleted
                        && e.Status == EventStatus.Published
                        && e.RegistrationDeadline < now)
            .ToListAsync(cancellationToken);

        if (pastDeadlineEvents.Count > 0)
        {
            foreach (var ev in pastDeadlineEvents)
            {
                ev.Status = EventStatus.RegistrationClosed;
                ev.UpdatedAt = now;
                _logger.LogInformation("Auto-closed registration for event: {EventTitle} (Id: {EventId})", ev.Title, ev.Id);
            }
        }

        if (expiredActiveEvents.Count > 0 || pastDeadlineEvents.Count > 0)
        {
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task CleanupExpiredTokensAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var now = DateTime.UtcNow;

        // Clean up OTP challenges older than 1 hour
        var oldOtps = await context.OtpChallenges
            .Where(o => o.ExpiresAt < now.AddHours(-1))
            .ToListAsync(cancellationToken);

        if (oldOtps.Count > 0)
        {
            context.OtpChallenges.RemoveRange(oldOtps);
        }

        // Clean up dynamic QR tokens expired more than 2 hours ago
        var oldQrTokens = await context.QrTokens
            .Where(q => q.ExpiresAt < now.AddHours(-2))
            .ToListAsync(cancellationToken);

        if (oldQrTokens.Count > 0)
        {
            context.QrTokens.RemoveRange(oldQrTokens);
        }

        if (oldOtps.Count > 0 || oldQrTokens.Count > 0)
        {
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}

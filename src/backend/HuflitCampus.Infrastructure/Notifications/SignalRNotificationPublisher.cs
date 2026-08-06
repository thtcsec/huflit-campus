using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Infrastructure.Persistence;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HuflitCampus.Infrastructure.Notifications;

public sealed class NotificationHub : Hub
{
    public const string HubPath = "/hubs/notifications";

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrWhiteSpace(userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));

        await base.OnConnectedAsync();
    }

    public static string UserGroup(string userId) => $"user:{userId}";
    public static string UserGroup(Guid userId) => UserGroup(userId.ToString());
}

public sealed class SignalRNotificationPublisher : INotificationPublisher
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IServiceScopeFactory _scopeFactory;

    public SignalRNotificationPublisher(
        IHubContext<NotificationHub> hubContext,
        IServiceScopeFactory scopeFactory)
    {
        _hubContext = hubContext;
        _scopeFactory = scopeFactory;
    }

    public async Task PublishAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var exists = await db.Notifications.AnyAsync(n => n.Id == notification.Id, cancellationToken);
            if (!exists)
            {
                await db.Notifications.AddAsync(notification, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
            }
        }

        await _hubContext.Clients
            .Group(NotificationHub.UserGroup(notification.UserId))
            .SendAsync(
                "notificationReceived",
                new
                {
                    notification.Id,
                    notification.UserId,
                    Type = notification.Type.ToString(),
                    notification.Title,
                    notification.Body,
                    notification.DataJson,
                    notification.IsRead,
                    notification.CreatedAt
                },
                cancellationToken);
    }

    public async Task PublishManyAsync(
        IEnumerable<Notification> notifications,
        CancellationToken cancellationToken = default)
    {
        var list = notifications.ToList();
        if (list.Count == 0) return;

        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            foreach (var n in list)
            {
                var exists = await db.Notifications.AnyAsync(x => x.Id == n.Id, cancellationToken);
                if (!exists)
                {
                    await db.Notifications.AddAsync(n, cancellationToken);
                }
            }
            await db.SaveChangesAsync(cancellationToken);
        }

        foreach (var notification in list)
        {
            await _hubContext.Clients
                .Group(NotificationHub.UserGroup(notification.UserId))
                .SendAsync(
                    "notificationReceived",
                    new
                    {
                        notification.Id,
                        notification.UserId,
                        Type = notification.Type.ToString(),
                        notification.Title,
                        notification.Body,
                        notification.DataJson,
                        notification.IsRead,
                        notification.CreatedAt
                    },
                    cancellationToken);
        }
    }
}

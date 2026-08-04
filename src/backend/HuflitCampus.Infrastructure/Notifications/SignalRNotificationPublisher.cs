using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

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

    public SignalRNotificationPublisher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task PublishAsync(Notification notification, CancellationToken cancellationToken = default)
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

    public async Task PublishManyAsync(
        IEnumerable<Notification> notifications,
        CancellationToken cancellationToken = default)
    {
        foreach (var notification in notifications)
            await PublishAsync(notification, cancellationToken);
    }
}

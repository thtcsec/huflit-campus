using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.DTOs.Notifications;

public class NotificationDto
{
    public Guid Id { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? DataJson { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

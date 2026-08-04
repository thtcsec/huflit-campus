using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? DataJson { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }

    public User User { get; set; } = null!;

    public static Notification Create(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        string? dataJson = null)
    {
        return new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            DataJson = dataJson,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkAsRead()
    {
        if (IsRead)
            return;

        IsRead = true;
        ReadAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsUnread()
    {
        IsRead = false;
        ReadAt = null;
        UpdatedAt = DateTime.UtcNow;
    }
}

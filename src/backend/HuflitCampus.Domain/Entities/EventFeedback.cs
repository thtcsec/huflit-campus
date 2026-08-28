using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class EventFeedback : BaseEntity
{
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; } // 1 to 5
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }

    public Event Event { get; set; } = null!;
    public User User { get; set; } = null!;

    public static EventFeedback Create(
        Guid eventId,
        Guid userId,
        int rating,
        string comment,
        bool isAnonymous = false)
    {
        return new EventFeedback
        {
            EventId = eventId,
            UserId = userId,
            Rating = Math.Clamp(rating, 1, 5),
            Comment = comment.Trim(),
            IsAnonymous = isAnonymous,
            CreatedAt = DateTime.UtcNow
        };
    }
}

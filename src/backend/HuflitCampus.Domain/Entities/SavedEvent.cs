using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class SavedEvent : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid EventId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Event Event { get; set; } = null!;

    public static SavedEvent Create(Guid userId, Guid eventId)
    {
        return new SavedEvent
        {
            UserId = userId,
            EventId = eventId,
            SavedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }
}

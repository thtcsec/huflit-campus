using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class EventSpeaker : BaseEntity
{
    public Guid EventId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public int SortOrder { get; set; }

    public Event Event { get; set; } = null!;

    public static EventSpeaker Create(
        Guid eventId,
        string name,
        string? title = null,
        string? bio = null,
        string? avatarUrl = null,
        int sortOrder = 0)
    {
        return new EventSpeaker
        {
            EventId = eventId,
            Name = name,
            Title = title,
            Bio = bio,
            AvatarUrl = avatarUrl,
            SortOrder = sortOrder,
            CreatedAt = DateTime.UtcNow
        };
    }
}

using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public enum MediaType
{
    Image = 0,
    Video = 1
}

public class EventMedia : BaseEntity
{
    public Guid EventId { get; set; }
    public string Url { get; set; } = string.Empty;
    public MediaType MediaType { get; set; } = MediaType.Image;
    public int SortOrder { get; set; }
    public string? Caption { get; set; }

    public Event Event { get; set; } = null!;

    public static EventMedia Create(Guid eventId, string url, MediaType mediaType, int sortOrder, string? caption = null)
    {
        return new EventMedia
        {
            EventId = eventId,
            Url = url,
            MediaType = mediaType,
            SortOrder = sortOrder,
            Caption = caption,
            CreatedAt = DateTime.UtcNow
        };
    }
}

using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class Announcement : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public Guid CreatedById { get; set; }

    public User CreatedByUser { get; set; } = null!;

    public bool IsActive
    {
        get
        {
            var now = DateTime.UtcNow;
            return !IsDeleted
                   && PublishedAt.HasValue
                   && PublishedAt.Value <= now
                   && (!ExpiresAt.HasValue || ExpiresAt.Value > now);
        }
    }

    public static Announcement Create(
        string title,
        string body,
        Guid createdById,
        bool isPinned = false,
        DateTime? publishedAt = null,
        DateTime? expiresAt = null)
    {
        return new Announcement
        {
            Title = title,
            Body = body,
            CreatedById = createdById,
            IsPinned = isPinned,
            PublishedAt = publishedAt,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Publish(DateTime? publishedAt = null)
    {
        PublishedAt = publishedAt ?? DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Pin()
    {
        IsPinned = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unpin()
    {
        IsPinned = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete(string? deletedBy = null)
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }
}

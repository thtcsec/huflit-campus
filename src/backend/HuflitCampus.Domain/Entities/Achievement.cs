using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class Achievement : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public static Achievement Create(
        Guid userId,
        string title,
        string description,
        string? iconUrl = null)
    {
        return new Achievement
        {
            UserId = userId,
            Title = title,
            Description = description,
            IconUrl = iconUrl,
            EarnedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }
}

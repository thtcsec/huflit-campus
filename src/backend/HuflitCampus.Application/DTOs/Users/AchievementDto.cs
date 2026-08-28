namespace HuflitCampus.Application.DTOs.Users;

public sealed class AchievementDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public DateTime EarnedAt { get; set; }
}

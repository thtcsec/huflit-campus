using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }

    public User User { get; set; } = null!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsActive => !IsRevoked && !IsExpired && !IsDeleted;

    public void Revoke(string? replacedByToken = null)
    {
        RevokedAt = DateTime.UtcNow;
        ReplacedByToken = replacedByToken;
        UpdatedAt = DateTime.UtcNow;
    }

    public static RefreshToken Create(Guid userId, string token, DateTime expiresAt)
    {
        return new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };
    }
}

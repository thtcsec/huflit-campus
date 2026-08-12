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

    /// <summary>
    /// Stores a SHA-256 hash of the raw refresh token. Never persist the plaintext token.
    /// </summary>
    public static RefreshToken Create(Guid userId, string rawToken, DateTime expiresAt)
    {
        return new RefreshToken
        {
            UserId = userId,
            Token = TokenHash.Compute(rawToken),
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };
    }
}

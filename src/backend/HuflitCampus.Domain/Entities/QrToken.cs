using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class QrToken : BaseEntity
{
    public Guid EventId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public bool IsSingleUse { get; set; }
    public DateTime? UsedAt { get; set; }
    /// <summary>Sequence number for rotating/dynamic QR tokens.</summary>
    public int Sequence { get; set; }

    public Event Event { get; set; } = null!;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsUsed => UsedAt.HasValue;
    public bool IsValid => !IsExpired && !IsUsed && !IsDeleted;

    public static QrToken Create(
        Guid eventId,
        string token,
        DateTime expiresAt,
        int sequence,
        bool isSingleUse = true)
    {
        return new QrToken
        {
            EventId = eventId,
            Token = token,
            ExpiresAt = expiresAt,
            IssuedAt = DateTime.UtcNow,
            Sequence = sequence,
            IsSingleUse = isSingleUse,
            CreatedAt = DateTime.UtcNow
        };
    }

    public Result MarkUsed()
    {
        if (IsDeleted)
            return Result.Failure("QR token no longer exists.");

        if (IsExpired)
            return Result.Failure("QR token has expired.");

        if (IsSingleUse && IsUsed)
            return Result.Failure("QR token has already been used.");

        UsedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}

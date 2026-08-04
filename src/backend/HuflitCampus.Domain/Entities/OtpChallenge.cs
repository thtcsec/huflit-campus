using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Entities;

public class OtpChallenge : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; }
    public bool IsConsumed { get; set; }

    public const int MaxAttempts = 5;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsValid => !IsConsumed && !IsExpired && !IsDeleted && Attempts < MaxAttempts;

    public static OtpChallenge Create(string email, string codeHash, TimeSpan lifetime)
    {
        return new OtpChallenge
        {
            Email = email.Trim().ToLowerInvariant(),
            CodeHash = codeHash,
            ExpiresAt = DateTime.UtcNow.Add(lifetime),
            Attempts = 0,
            IsConsumed = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public Result VerifyAttempt()
    {
        if (IsConsumed)
            return Result.Failure("OTP has already been used.");

        if (IsExpired)
            return Result.Failure("OTP has expired.");

        if (Attempts >= MaxAttempts)
            return Result.Failure("Maximum OTP verification attempts exceeded.");

        Attempts++;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void Consume()
    {
        IsConsumed = true;
        UpdatedAt = DateTime.UtcNow;
    }
}

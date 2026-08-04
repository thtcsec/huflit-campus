using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.DTOs.Auth;

public class MicrosoftLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? StudentId { get; set; }
    public string? Faculty { get; set; }
    public string? Major { get; set; }
}

public class GuestOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public class GuestOtpVerifyRequest
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? FullName { get; set; }
}

public class RefreshTokenRequest
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
    public UserProfileDto User { get; set; } = null!;
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? StudentId { get; set; }
    public string? Faculty { get; set; }
    public string? Major { get; set; }
    public string? Phone { get; set; }
    public UserRole Role { get; set; }
    public string AuthProvider { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool HasFcmToken { get; set; }
    public DateTime CreatedAt { get; set; }
}

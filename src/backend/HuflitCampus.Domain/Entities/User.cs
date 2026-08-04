using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? StudentId { get; set; }
    public string? Faculty { get; set; }
    public string? Major { get; set; }
    public UserRole Role { get; set; } = UserRole.Guest;
    public AuthProvider AuthProvider { get; set; }
    /// <summary>Microsoft Entra object id (oid), when AuthProvider is MicrosoftEntra.</summary>
    public string? ExternalId { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public string? FcmToken { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<SavedEvent> SavedEvents { get; set; } = new List<SavedEvent>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string fullName, string? phone, string? faculty, string? major, string? avatarUrl)
    {
        FullName = fullName;
        Phone = phone;
        Faculty = faculty;
        Major = major;
        AvatarUrl = avatarUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AssignRole(UserRole role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFcmToken(string? token)
    {
        FcmToken = token;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete(string? deletedBy = null)
    {
        IsDeleted = true;
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }
}

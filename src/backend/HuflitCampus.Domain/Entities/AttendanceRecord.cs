using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Entities;

public class AttendanceRecord : BaseEntity
{
    public Guid RegistrationId { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public AttendanceType Type { get; set; }
    public AttendanceStatus Status { get; set; }
    public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
    public Guid? QrTokenId { get; set; }
    public string? DeviceInfo { get; set; }
    public bool IsLate { get; set; }

    public EventRegistration Registration { get; set; } = null!;
    public Event Event { get; set; } = null!;
    public User User { get; set; } = null!;
    public QrToken? QrToken { get; set; }

    public static AttendanceRecord CreateCheckIn(
        Guid registrationId,
        Guid eventId,
        Guid userId,
        AttendanceStatus status,
        Guid? qrTokenId = null,
        string? deviceInfo = null,
        bool isLate = false)
    {
        return new AttendanceRecord
        {
            RegistrationId = registrationId,
            EventId = eventId,
            UserId = userId,
            Type = AttendanceType.CheckIn,
            Status = status,
            ScannedAt = DateTime.UtcNow,
            QrTokenId = qrTokenId,
            DeviceInfo = deviceInfo,
            IsLate = isLate,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static AttendanceRecord CreateCheckOut(
        Guid registrationId,
        Guid eventId,
        Guid userId,
        AttendanceStatus status,
        Guid? qrTokenId = null,
        string? deviceInfo = null)
    {
        return new AttendanceRecord
        {
            RegistrationId = registrationId,
            EventId = eventId,
            UserId = userId,
            Type = AttendanceType.CheckOut,
            Status = status,
            ScannedAt = DateTime.UtcNow,
            QrTokenId = qrTokenId,
            DeviceInfo = deviceInfo,
            IsLate = false,
            CreatedAt = DateTime.UtcNow
        };
    }
}

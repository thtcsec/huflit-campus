using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.DTOs.Attendance;

public class QrPayloadDto
{
    public Guid EventId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int Sequence { get; set; }
    public string? EventTitle { get; set; }
}

public class CheckInRequest
{
    public Guid EventId { get; set; }
    public string QrToken { get; set; } = string.Empty;
    public string? DeviceInfo { get; set; }
}

public class CheckOutRequest
{
    public Guid EventId { get; set; }
    public string QrToken { get; set; } = string.Empty;
    public string? DeviceInfo { get; set; }
}

public class GenerateQrRequest
{
    public Guid EventId { get; set; }
    public int ValiditySeconds { get; set; } = 30;
    public bool IsSingleUse { get; set; } = true;
}

public class AttendanceDto
{
    public Guid Id { get; set; }
    public Guid RegistrationId { get; set; }
    public Guid EventId { get; set; }
    public string? EventTitle { get; set; }
    public Guid UserId { get; set; }
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
    public AttendanceType Type { get; set; }
    public AttendanceStatus Status { get; set; }
    public DateTime ScannedAt { get; set; }
    public bool IsLate { get; set; }
    public string? DeviceInfo { get; set; }
}

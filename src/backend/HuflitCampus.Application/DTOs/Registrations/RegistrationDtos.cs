using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.DTOs.Registrations;

public class RegisterEventRequest
{
    public string? Notes { get; set; }
}

public class RegistrationDto
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string? EventTitle { get; set; }
    public string? EventBannerUrl { get; set; }
    public DateTime? EventStartAt { get; set; }
    public Guid UserId { get; set; }
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserAvatarUrl { get; set; }
    public RegistrationStatus Status { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? WaitlistPosition { get; set; }
    public string? TicketCode { get; set; }
    public string? Notes { get; set; }
}

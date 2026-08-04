using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Entities;

public class EventRegistration : BaseEntity
{
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public int? WaitlistPosition { get; set; }
    public string? TicketCode { get; set; }
    public string? Notes { get; set; }

    public Event Event { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();

    public static EventRegistration Create(Guid eventId, Guid userId, string? ticketCode = null, string? notes = null)
    {
        return new EventRegistration
        {
            EventId = eventId,
            UserId = userId,
            Status = RegistrationStatus.Pending,
            RegisteredAt = DateTime.UtcNow,
            TicketCode = ticketCode ?? GenerateTicketCode(),
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
    }

    public Result Approve()
    {
        if (Status is not (RegistrationStatus.Pending or RegistrationStatus.Waitlisted))
            return Result.Failure($"Cannot approve registration in status '{Status}'.");

        Status = RegistrationStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
        WaitlistPosition = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Reject(string? notes = null)
    {
        if (Status is not (RegistrationStatus.Pending or RegistrationStatus.Waitlisted))
            return Result.Failure($"Cannot reject registration in status '{Status}'.");

        Status = RegistrationStatus.Rejected;
        WaitlistPosition = null;
        if (!string.IsNullOrWhiteSpace(notes))
            Notes = notes.Trim();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MoveToWaitlist(int position)
    {
        if (Status is not (RegistrationStatus.Pending or RegistrationStatus.Approved))
            return Result.Failure($"Cannot move registration to waitlist from status '{Status}'.");

        if (position < 1)
            return Result.Failure("Waitlist position must be at least 1.");

        Status = RegistrationStatus.Waitlisted;
        WaitlistPosition = position;
        ApprovedAt = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Cancel()
    {
        if (Status is RegistrationStatus.Cancelled or RegistrationStatus.Attended or RegistrationStatus.NoShow)
            return Result.Failure($"Cannot cancel registration in status '{Status}'.");

        Status = RegistrationStatus.Cancelled;
        WaitlistPosition = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkAttended()
    {
        if (Status is not (RegistrationStatus.Approved or RegistrationStatus.Pending))
            return Result.Failure($"Cannot mark attendance for registration in status '{Status}'.");

        Status = RegistrationStatus.Attended;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkNoShow()
    {
        if (Status != RegistrationStatus.Approved)
            return Result.Failure($"Cannot mark no-show for registration in status '{Status}'.");

        Status = RegistrationStatus.NoShow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    private static string GenerateTicketCode()
        => $"TKT-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
}

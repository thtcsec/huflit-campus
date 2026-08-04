using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Entities;

public class Event : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Agenda { get; set; }
    public string? BannerUrl { get; set; }
    public EventCategory Category { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Draft;
    public Guid OrganizerId { get; set; }
    public string? Faculty { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public int Capacity { get; set; }
    public bool WaitlistEnabled { get; set; }
    public int MaxWaitlist { get; set; }
    public DateTime RegistrationDeadline { get; set; }
    public DateTime? CheckInStart { get; set; }
    public DateTime? CheckInEnd { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string? Requirements { get; set; }
    public string? Sponsor { get; set; }
    public bool IsFeatured { get; set; }
    public int ViewCount { get; set; }
    public int SaveCount { get; set; }
    public int RegistrationCount { get; set; }
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    public User Organizer { get; set; } = null!;
    public User? ApprovedBy { get; set; }
    public ICollection<EventMedia> Media { get; set; } = new List<EventMedia>();
    public ICollection<EventSpeaker> Speakers { get; set; } = new List<EventSpeaker>();
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<QrToken> QrTokens { get; set; } = new List<QrToken>();
    public ICollection<SavedEvent> SavedByUsers { get; set; } = new List<SavedEvent>();

    public int RemainingSeats => Math.Max(0, Capacity - RegistrationCount);

    public bool HasAvailableSeats => RemainingSeats > 0;

    public bool IsRegistrationOpen
    {
        get
        {
            var now = DateTime.UtcNow;
            return (Status == EventStatus.Published || Status == EventStatus.Approved)
                   && now < RegistrationDeadline
                   && now < StartAt
                   && !IsDeleted;
        }
    }

    public Result SubmitForApproval()
    {
        if (Status is not (EventStatus.Draft or EventStatus.Rejected))
            return Result.Failure($"Cannot submit for approval from status '{Status}'.");

        if (string.IsNullOrWhiteSpace(Title))
            return Result.Failure("Title is required before submitting for approval.");

        if (StartAt >= EndAt)
            return Result.Failure("Event end time must be after start time.");

        if (RegistrationDeadline > StartAt)
            return Result.Failure("Registration deadline must be on or before event start.");

        if (Capacity <= 0)
            return Result.Failure("Capacity must be greater than zero.");

        Status = EventStatus.PendingApproval;
        RejectionReason = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Approve(Guid approvedById)
    {
        if (Status != EventStatus.PendingApproval)
            return Result.Failure($"Cannot approve event in status '{Status}'.");

        Status = EventStatus.Approved;
        ApprovedById = approvedById;
        ApprovedAt = DateTime.UtcNow;
        RejectionReason = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Reject(string reason)
    {
        if (Status != EventStatus.PendingApproval)
            return Result.Failure($"Cannot reject event in status '{Status}'.");

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure("Rejection reason is required.");

        Status = EventStatus.Rejected;
        RejectionReason = reason.Trim();
        ApprovedById = null;
        ApprovedAt = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Publish()
    {
        if (Status is not (EventStatus.Approved or EventStatus.RegistrationClosed))
            return Result.Failure($"Cannot publish event in status '{Status}'.");

        Status = EventStatus.Published;
        PublishedAt ??= DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Cancel(string? reason = null)
    {
        if (Status is EventStatus.Cancelled or EventStatus.Completed or EventStatus.Draft)
            return Result.Failure($"Cannot cancel event in status '{Status}'.");

        Status = EventStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(reason))
            RejectionReason = reason.Trim();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result CloseRegistration()
    {
        if (Status != EventStatus.Published)
            return Result.Failure($"Cannot close registration for event in status '{Status}'.");

        Status = EventStatus.RegistrationClosed;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result MarkCompleted()
    {
        if (Status is not (EventStatus.Published or EventStatus.RegistrationClosed))
            return Result.Failure($"Cannot complete event in status '{Status}'.");

        Status = EventStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void SoftDelete(string? deletedBy = null)
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }

    public Result CanRegister(DateTime? at = null)
    {
        var now = at ?? DateTime.UtcNow;

        if (IsDeleted)
            return Result.Failure("Event no longer exists.");

        if (Status is EventStatus.Cancelled)
            return Result.Failure("Event has been cancelled.");

        if (Status is EventStatus.Completed)
            return Result.Failure("Event has already completed.");

        if (Status is EventStatus.RegistrationClosed)
            return Result.Failure("Registration is closed.");

        if (Status is not (EventStatus.Published or EventStatus.Approved))
            return Result.Failure("Event is not open for registration.");

        if (now >= RegistrationDeadline)
            return Result.Failure("Registration deadline has passed.");

        if (now >= StartAt)
            return Result.Failure("Event has already started.");

        if (!HasAvailableSeats && !WaitlistEnabled)
            return Result.Failure("Event is at full capacity.");

        if (!HasAvailableSeats && WaitlistEnabled)
        {
            var waitlistCount = Registrations.Count(r =>
                r.Status == RegistrationStatus.Waitlisted && !r.IsDeleted);
            if (waitlistCount >= MaxWaitlist)
                return Result.Failure("Waitlist is full.");
        }

        return Result.Success();
    }

    public void IncrementViewCount()
    {
        ViewCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void IncrementSaveCount()
    {
        SaveCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DecrementSaveCount()
    {
        if (SaveCount > 0)
            SaveCount--;
        UpdatedAt = DateTime.UtcNow;
    }

    public void IncrementRegistrationCount()
    {
        RegistrationCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DecrementRegistrationCount()
    {
        if (RegistrationCount > 0)
            RegistrationCount--;
        UpdatedAt = DateTime.UtcNow;
    }
}

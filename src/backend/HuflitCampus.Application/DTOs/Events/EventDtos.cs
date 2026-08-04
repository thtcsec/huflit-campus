using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.DTOs.Events;

public class EventListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? BannerUrl { get; set; }
    public EventCategory Category { get; set; }
    public EventStatus Status { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string? Faculty { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public DateTime RegistrationDeadline { get; set; }
    public int Capacity { get; set; }
    public int RegistrationCount { get; set; }
    public int RemainingSeats { get; set; }
    public bool IsFeatured { get; set; }
    public int ViewCount { get; set; }
    public int SaveCount { get; set; }
    public Guid OrganizerId { get; set; }
    public string? OrganizerName { get; set; }
    public bool IsSaved { get; set; }
    public bool IsRegistered { get; set; }
}

public class EventDetailDto : EventListItemDto
{
    public string Description { get; set; } = string.Empty;
    public string? Agenda { get; set; }
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public bool WaitlistEnabled { get; set; }
    public int MaxWaitlist { get; set; }
    public DateTime? CheckInStart { get; set; }
    public DateTime? CheckInEnd { get; set; }
    public string? Requirements { get; set; }
    public string? Sponsor { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<EventMediaDto> Media { get; set; } = [];
    public List<EventSpeakerDto> Speakers { get; set; } = [];
}

public class EventMediaDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string? Caption { get; set; }
}

public class EventSpeakerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public int SortOrder { get; set; }
}

public class CreateEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Agenda { get; set; }
    public string? BannerUrl { get; set; }
    public EventCategory Category { get; set; }
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
    public List<EventSpeakerDto>? Speakers { get; set; }
    public List<EventMediaDto>? Media { get; set; }
}

public class UpdateEventRequest : CreateEventRequest
{
}

public class EventSearchRequest
{
    public string? Search { get; set; }
    public EventCategory? Category { get; set; }
    public EventStatus? Status { get; set; }
    public string? Faculty { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public Guid? OrganizerId { get; set; }
    public bool? FeaturedOnly { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class ApproveEventRequest
{
    public string? Note { get; set; }
}

public class RejectEventRequest
{
    public string Reason { get; set; } = string.Empty;
}

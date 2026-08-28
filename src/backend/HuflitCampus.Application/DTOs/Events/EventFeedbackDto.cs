namespace HuflitCampus.Application.DTOs.Events;

public sealed class EventFeedbackDto
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class CreateEventFeedbackRequest
{
    public int Rating { get; set; } = 5;
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
}

public sealed class EventFeedbackSummaryDto
{
    public double AverageRating { get; set; }
    public int TotalFeedbacks { get; set; }
    public Dictionary<int, int> RatingCounts { get; set; } = new();
    public IReadOnlyList<EventFeedbackDto> Items { get; set; } = [];
}

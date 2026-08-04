using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.DTOs.Calendar;

public class CalendarEventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public EventCategory Category { get; set; }
    public EventStatus Status { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string? BannerUrl { get; set; }
    public bool IsRegistered { get; set; }
}

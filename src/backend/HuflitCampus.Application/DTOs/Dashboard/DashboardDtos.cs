namespace HuflitCampus.Application.DTOs.Dashboard;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalEvents { get; set; }
    public int PublishedEvents { get; set; }
    public int PendingApprovalEvents { get; set; }
    public int TotalRegistrations { get; set; }
    public int TotalAttendance { get; set; }
    public List<CategoryCountDto> TopCategories { get; set; } = [];
    public List<OrganizerStatsDto> TopOrganizers { get; set; } = [];
    public List<PopularEventDto> PopularEvents { get; set; } = [];
}

public class AnalyticsSummaryDto
{
    public int EventsThisMonth { get; set; }
    public int RegistrationsThisMonth { get; set; }
    public int AttendanceThisMonth { get; set; }
    public double AverageAttendanceRate { get; set; }
    public List<CategoryCountDto> CategoryBreakdown { get; set; } = [];
}

public class CategoryCountDto
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class OrganizerStatsDto
{
    public Guid OrganizerId { get; set; }
    public string OrganizerName { get; set; } = string.Empty;
    public int EventCount { get; set; }
    public int TotalRegistrations { get; set; }
}

public class PopularEventDto
{
    public Guid EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int RegistrationCount { get; set; }
    public int ViewCount { get; set; }
    public int SaveCount { get; set; }
}

using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HuflitCampus.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    public static readonly Guid AdminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid OrganizerUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    public static readonly Guid WorkshopEventId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid CareerEventId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid SportsEventId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        await context.Database.EnsureCreatedAsync(cancellationToken);

        if (await context.Users.IgnoreQueryFilters().AnyAsync(u => u.Id == AdminUserId, cancellationToken))
        {
            logger.LogInformation("Database already seeded.");
            return;
        }

        logger.LogInformation("Seeding HUFLIT Campus database...");

        var now = DateTime.UtcNow;

        var admin = new User
        {
            Id = AdminUserId,
            Email = "admin@huflit.edu.vn",
            FullName = "System Administrator",
            Role = UserRole.Administrator,
            AuthProvider = AuthProvider.MicrosoftEntra,
            Faculty = "Information Technology",
            IsActive = true,
            CreatedAt = now,
            CreatedBy = "seed"
        };

        var organizer = new User
        {
            Id = OrganizerUserId,
            Email = "events@huflit.edu.vn",
            FullName = "Campus Events Office",
            Role = UserRole.FacultyManager,
            AuthProvider = AuthProvider.MicrosoftEntra,
            Faculty = "Student Affairs",
            IsActive = true,
            CreatedAt = now,
            CreatedBy = "seed"
        };

        context.Users.AddRange(admin, organizer);

        var announcements = new[]
        {
            Announcement.Create(
                "Welcome to HUFLIT Campus EMS",
                "Discover workshops, career fairs, and sports events across all HUFLIT campuses. Register early to secure your seat.",
                AdminUserId,
                isPinned: true,
                publishedAt: now,
                expiresAt: now.AddMonths(6)),
            Announcement.Create(
                "Check-in with Dynamic QR",
                "Event check-in now uses rotating QR codes. Arrive on time and scan at the entrance booth.",
                AdminUserId,
                isPinned: false,
                publishedAt: now,
                expiresAt: now.AddMonths(3))
        };
        context.Announcements.AddRange(announcements);

        var workshop = CreateEvent(
            WorkshopEventId,
            "AI Prompt Engineering Workshop",
            "ai-prompt-engineering-workshop",
            "Hands-on workshop covering practical prompt patterns for study, research, and campus projects.",
            EventCategory.Workshop,
            organizer.Id,
            "Information Technology",
            "Lab A301 – Sư Vạn Hạnh Campus",
            "828 Sư Vạn Hạnh, Quận 10, TP.HCM",
            capacity: 80,
            startAt: now.AddDays(14).Date.AddHours(9),
            endAt: now.AddDays(14).Date.AddHours(12),
            featured: true,
            now);

        workshop.Speakers.Add(EventSpeaker.Create(
            workshop.Id,
            "Dr. Nguyen Minh Tu",
            "AI Lecturer",
            "Faculty of Information Technology, HUFLIT.",
            sortOrder: 0));

        var career = CreateEvent(
            CareerEventId,
            "HUFLIT Career Fair 2026",
            "huflit-career-fair-2026",
            "Meet hiring partners from tech, logistics, hospitality, and language services. Bring your CV.",
            EventCategory.Career,
            organizer.Id,
            "Career Center",
            "Main Hall – Hoa Binh Campus",
            "828 Đường Sư Vạn Hạnh (nối dài), Quận Tân Bình",
            capacity: 500,
            startAt: now.AddDays(30).Date.AddHours(8),
            endAt: now.AddDays(30).Date.AddHours(17),
            featured: true,
            now);

        career.Speakers.Add(EventSpeaker.Create(
            career.Id,
            "Tran Thao My",
            "Career Advisor",
            sortOrder: 0));

        var sports = CreateEvent(
            SportsEventId,
            "Inter-Faculty Football Cup",
            "inter-faculty-football-cup",
            "Friendly football tournament for students across faculties. Team registration required.",
            EventCategory.Sports,
            organizer.Id,
            "Physical Education",
            "Sports Ground – Cong Hoa Campus",
            "69/68 Đường Cộng Hòa, Quận Tân Bình",
            capacity: 120,
            startAt: now.AddDays(21).Date.AddHours(15),
            endAt: now.AddDays(21).Date.AddHours(18),
            featured: false,
            now);

        context.Events.AddRange(workshop, career, sports);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seed completed: admin, organizer, announcements, and 3 demo events.");
    }

    private static Event CreateEvent(
        Guid id,
        string title,
        string slug,
        string description,
        EventCategory category,
        Guid organizerId,
        string faculty,
        string locationName,
        string address,
        int capacity,
        DateTime startAt,
        DateTime endAt,
        bool featured,
        DateTime now)
    {
        return new Event
        {
            Id = id,
            Title = title,
            Slug = slug,
            Description = description,
            Category = category,
            Status = EventStatus.Published,
            OrganizerId = organizerId,
            Faculty = faculty,
            LocationName = locationName,
            Address = address,
            Capacity = capacity,
            WaitlistEnabled = true,
            MaxWaitlist = Math.Max(20, capacity / 5),
            RegistrationDeadline = startAt.AddDays(-1),
            CheckInStart = startAt.AddMinutes(-30),
            CheckInEnd = endAt,
            StartAt = startAt,
            EndAt = endAt,
            IsFeatured = featured,
            PublishedAt = now,
            ApprovedAt = now,
            ApprovedById = AdminUserId,
            CreatedAt = now,
            CreatedBy = "seed"
        };
    }
}

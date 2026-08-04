using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IDateTimeProvider dateTime,
        ICurrentUserService? currentUser = null)
        : base(options)
    {
        _dateTime = dateTime;
        _currentUser = currentUser;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventMedia> EventMedia => Set<EventMedia>();
    public DbSet<EventSpeaker> EventSpeakers => Set<EventSpeaker>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<QrToken> QrTokens => Set<QrToken>();
    public DbSet<SavedEvent> SavedEvents => Set<SavedEvent>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<OtpChallenge> OtpChallenges => Set<OtpChallenge>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        ApplySoftDeleteFilters(modelBuilder);
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        ApplyAuditInfo();
        return base.SaveChanges();
    }

    private void ApplyAuditInfo()
    {
        var now = _dateTime.UtcNow;
        var userId = _currentUser?.UserId?.ToString();

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    if (entry.Entity.CreatedAt == default)
                        entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy ??= userId;
                    entry.Entity.IsDeleted = false;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userId ?? entry.Entity.UpdatedBy;
                    break;
            }
        }
    }

    private static void ApplySoftDeleteFilters(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
                continue;

            var method = typeof(ApplicationDbContext)
                .GetMethod(nameof(SetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                .MakeGenericMethod(entityType.ClrType);

            method.Invoke(null, [modelBuilder]);
        }
    }

    private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ISoftDelete
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(e => !e.IsDeleted);
    }
}

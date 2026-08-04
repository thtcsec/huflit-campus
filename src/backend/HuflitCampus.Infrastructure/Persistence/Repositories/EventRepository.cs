using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class EventRepository : Repository<Event>, IEventRepository
{
    public EventRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<Event?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(e => e.Slug == slug, cancellationToken);

    public Task<Event?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => DbSet
            .Include(e => e.Organizer)
            .Include(e => e.ApprovedBy)
            .Include(e => e.Media.OrderBy(m => m.SortOrder))
            .Include(e => e.Speakers.OrderBy(s => s.SortOrder))
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public Task<bool> SlugExistsAsync(
        string slug,
        Guid? excludeEventId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => e.Slug == slug);
        if (excludeEventId.HasValue)
            query = query.Where(e => e.Id != excludeEventId.Value);
        return query.AnyAsync(cancellationToken);
    }

    public async Task<PagedResult<Event>> GetPublishedAsync(
        int page,
        int pageSize,
        EventCategory? category = null,
        string? faculty = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet.Where(e =>
            e.Status == EventStatus.Published || e.Status == EventStatus.RegistrationClosed);

        if (category.HasValue)
            query = query.Where(e => e.Category == category.Value);

        if (!string.IsNullOrWhiteSpace(faculty))
            query = query.Where(e => e.Faculty == faculty);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(e =>
                e.Title.ToLower().Contains(term)
                || e.Description.ToLower().Contains(term)
                || e.LocationName.ToLower().Contains(term));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(e => e.IsFeatured)
            .ThenBy(e => e.StartAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Event>.Create(items, page, pageSize, total);
    }

    public async Task<IReadOnlyList<Event>> GetFeaturedAsync(
        int take = 10,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(e => e.IsFeatured && e.Status == EventStatus.Published)
            .OrderBy(e => e.StartAt)
            .Take(take)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Event>> GetByOrganizerAsync(
        Guid organizerId,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(e => e.OrganizerId == organizerId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Event>> GetPendingApprovalAsync(
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(e => e.Status == EventStatus.PendingApproval)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Event>> GetUpcomingAsync(
        DateTime from,
        DateTime to,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(e =>
                (e.Status == EventStatus.Published || e.Status == EventStatus.RegistrationClosed)
                && e.StartAt >= from
                && e.StartAt <= to)
            .OrderBy(e => e.StartAt)
            .ToListAsync(cancellationToken);

    public async Task<PagedResult<Event>> GetByStatusAsync(
        EventStatus status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet.Where(e => e.Status == status);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(e => e.UpdatedAt ?? e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Event>.Create(items, page, pageSize, total);
    }
}

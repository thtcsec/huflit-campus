using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class AnnouncementRepository : Repository<Announcement>, IAnnouncementRepository
{
    public AnnouncementRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Announcement>> GetActiveAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var now = DateTime.UtcNow;
        var query = DbSet.Where(a =>
            a.PublishedAt != null
            && a.PublishedAt <= now
            && (a.ExpiresAt == null || a.ExpiresAt > now));

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Announcement>.Create(items, page, pageSize, total);
    }

    public async Task<IReadOnlyList<Announcement>> GetPinnedAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(a =>
                a.IsPinned
                && a.PublishedAt != null
                && a.PublishedAt <= now
                && (a.ExpiresAt == null || a.ExpiresAt > now))
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<Announcement>> GetAllAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet.AsQueryable();
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Announcement>.Create(items, page, pageSize, total);
    }
}

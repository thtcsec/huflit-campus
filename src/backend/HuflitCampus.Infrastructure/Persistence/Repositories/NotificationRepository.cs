using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Notification>> GetByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        bool unreadOnly = false,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet.Where(n => n.UserId == userId);
        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Notification>.Create(items, page, pageSize, total);
    }

    public Task<int> CountUnreadAsync(Guid userId, CancellationToken cancellationToken = default)
        => DbSet.CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await DbSet
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, now)
                    .SetProperty(n => n.UpdatedAt, now),
                cancellationToken);
    }

    public async Task AddRangeAsync(
        IEnumerable<Notification> notifications,
        CancellationToken cancellationToken = default)
    {
        await DbSet.AddRangeAsync(notifications, cancellationToken);
    }
}

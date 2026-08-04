using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class SavedEventRepository : Repository<SavedEvent>, ISavedEventRepository
{
    public SavedEventRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<SavedEvent?> GetAsync(
        Guid userId,
        Guid eventId,
        CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(s => s.UserId == userId && s.EventId == eventId, cancellationToken);

    public Task<bool> IsSavedAsync(
        Guid userId,
        Guid eventId,
        CancellationToken cancellationToken = default)
        => DbSet.AnyAsync(s => s.UserId == userId && s.EventId == eventId, cancellationToken);

    public async Task<PagedResult<SavedEvent>> GetByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet
            .Include(s => s.Event)
            .Where(s => s.UserId == userId);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(s => s.SavedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<SavedEvent>.Create(items, page, pageSize, total);
    }

    public async Task RemoveAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var saved = await GetAsync(userId, eventId, cancellationToken);
        if (saved is null)
            return;

        SoftDelete(saved);
    }
}

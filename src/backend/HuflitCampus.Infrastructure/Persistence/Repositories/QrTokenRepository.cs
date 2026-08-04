using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class QrTokenRepository : Repository<QrToken>, IQrTokenRepository
{
    public QrTokenRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<QrToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(q => q.Token == token, cancellationToken);

    public Task<QrToken?> GetActiveTokenAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return DbSet
            .Where(q =>
                q.EventId == eventId
                && q.ExpiresAt > now
                && q.UsedAt == null)
            .OrderByDescending(q => q.Sequence)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<QrToken?> GetLatestByEventAsync(Guid eventId, CancellationToken cancellationToken = default)
        => DbSet
            .Where(q => q.EventId == eventId)
            .OrderByDescending(q => q.Sequence)
            .ThenByDescending(q => q.IssuedAt)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<QrToken>> GetByEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(q => q.EventId == eventId)
            .OrderByDescending(q => q.Sequence)
            .ToListAsync(cancellationToken);

    public async Task<int> GetNextSequenceAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var max = await DbSet
            .Where(q => q.EventId == eventId)
            .MaxAsync(q => (int?)q.Sequence, cancellationToken);

        return (max ?? 0) + 1;
    }

    public async Task InvalidateActiveTokensAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await DbSet
            .Where(q => q.EventId == eventId && q.UsedAt == null && q.ExpiresAt > now)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(q => q.ExpiresAt, now)
                    .SetProperty(q => q.UpdatedAt, now),
                cancellationToken);
    }
}

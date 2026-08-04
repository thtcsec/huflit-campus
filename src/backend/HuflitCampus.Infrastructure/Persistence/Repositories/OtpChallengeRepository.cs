using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class OtpChallengeRepository : Repository<OtpChallenge>, IOtpChallengeRepository
{
    public OtpChallengeRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<OtpChallenge?> GetLatestActiveAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var now = DateTime.UtcNow;

        return DbSet
            .Where(o =>
                o.Email == normalized
                && !o.IsConsumed
                && o.ExpiresAt > now
                && o.Attempts < OtpChallenge.MaxAttempts)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task InvalidatePendingAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var now = DateTime.UtcNow;

        await DbSet
            .Where(o => o.Email == normalized && !o.IsConsumed)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(o => o.IsConsumed, true)
                    .SetProperty(o => o.UpdatedAt, now),
                cancellationToken);
    }

    public async Task CleanupExpiredAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        await DbSet
            .Where(o => o.ExpiresAt < now || o.IsConsumed)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(o => o.IsDeleted, true)
                    .SetProperty(o => o.UpdatedAt, now),
                cancellationToken);
    }
}

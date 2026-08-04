using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IOtpChallengeRepository : IRepository<OtpChallenge>
{
    Task<OtpChallenge?> GetLatestActiveAsync(string email, CancellationToken cancellationToken = default);
    Task InvalidatePendingAsync(string email, CancellationToken cancellationToken = default);
    Task CleanupExpiredAsync(CancellationToken cancellationToken = default);
}

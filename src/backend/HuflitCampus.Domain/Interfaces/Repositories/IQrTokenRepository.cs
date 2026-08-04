using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IQrTokenRepository : IRepository<QrToken>
{
    Task<QrToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<QrToken?> GetActiveTokenAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<QrToken?> GetLatestByEventAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QrToken>> GetByEventAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task<int> GetNextSequenceAsync(Guid eventId, CancellationToken cancellationToken = default);
    Task InvalidateActiveTokensAsync(Guid eventId, CancellationToken cancellationToken = default);
}

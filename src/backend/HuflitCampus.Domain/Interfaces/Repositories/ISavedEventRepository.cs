using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface ISavedEventRepository : IRepository<SavedEvent>
{
    Task<SavedEvent?> GetAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
    Task<bool> IsSavedAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
    Task<PagedResult<SavedEvent>> GetByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid userId, Guid eventId, CancellationToken cancellationToken = default);
}

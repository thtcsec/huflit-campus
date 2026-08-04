using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IAnnouncementRepository : IRepository<Announcement>
{
    Task<PagedResult<Announcement>> GetActiveAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Announcement>> GetPinnedAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<Announcement>> GetAllAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}

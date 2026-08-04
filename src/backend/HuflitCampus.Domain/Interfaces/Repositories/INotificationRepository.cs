using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface INotificationRepository : IRepository<Notification>
{
    Task<PagedResult<Notification>> GetByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        bool unreadOnly = false,
        CancellationToken cancellationToken = default);
    Task<int> CountUnreadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<Notification> notifications, CancellationToken cancellationToken = default);
}

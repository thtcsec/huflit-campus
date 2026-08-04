using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IEventRepository : IRepository<Event>
{
    Task<Event?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Event?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, Guid? excludeEventId = null, CancellationToken cancellationToken = default);
    Task<PagedResult<Event>> GetPublishedAsync(
        int page,
        int pageSize,
        EventCategory? category = null,
        string? faculty = null,
        string? search = null,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Event>> GetFeaturedAsync(int take = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Event>> GetByOrganizerAsync(Guid organizerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Event>> GetPendingApprovalAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Event>> GetUpcomingAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<PagedResult<Event>> GetByStatusAsync(
        EventStatus status,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}

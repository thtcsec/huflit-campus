using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IRegistrationRepository : IRepository<EventRegistration>
{
    Task<EventRegistration?> GetByEventAndUserAsync(
        Guid eventId,
        Guid userId,
        CancellationToken cancellationToken = default);
    Task<EventRegistration?> GetByTicketCodeAsync(string ticketCode, CancellationToken cancellationToken = default);
    Task<EventRegistration?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> HasRegisteredAsync(Guid eventId, Guid userId, CancellationToken cancellationToken = default);
    Task<PagedResult<EventRegistration>> GetByEventAsync(
        Guid eventId,
        int page,
        int pageSize,
        RegistrationStatus? status = null,
        CancellationToken cancellationToken = default);
    Task<PagedResult<EventRegistration>> GetByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        RegistrationStatus? status = null,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EventRegistration>> GetWaitlistAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);
    Task<int> CountByEventAndStatusAsync(
        Guid eventId,
        RegistrationStatus status,
        CancellationToken cancellationToken = default);
    Task<int> GetNextWaitlistPositionAsync(Guid eventId, CancellationToken cancellationToken = default);
}

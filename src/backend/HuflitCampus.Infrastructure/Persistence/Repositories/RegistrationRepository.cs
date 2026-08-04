using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class RegistrationRepository : Repository<EventRegistration>, IRegistrationRepository
{
    public RegistrationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<EventRegistration?> GetByEventAndUserAsync(
        Guid eventId,
        Guid userId,
        CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId, cancellationToken);

    public Task<EventRegistration?> GetByTicketCodeAsync(
        string ticketCode,
        CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(r => r.TicketCode == ticketCode, cancellationToken);

    public Task<EventRegistration?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => DbSet
            .Include(r => r.Event)
            .Include(r => r.User)
            .Include(r => r.AttendanceRecords)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public Task<bool> HasRegisteredAsync(
        Guid eventId,
        Guid userId,
        CancellationToken cancellationToken = default)
        => DbSet.AnyAsync(
            r => r.EventId == eventId
                 && r.UserId == userId
                 && r.Status != RegistrationStatus.Cancelled
                 && r.Status != RegistrationStatus.Rejected,
            cancellationToken);

    public async Task<PagedResult<EventRegistration>> GetByEventAsync(
        Guid eventId,
        int page,
        int pageSize,
        RegistrationStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet.Include(r => r.User).Where(r => r.EventId == eventId);
        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(r => r.RegisteredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<EventRegistration>.Create(items, page, pageSize, total);
    }

    public async Task<PagedResult<EventRegistration>> GetByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        RegistrationStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = DbSet.Include(r => r.Event).Where(r => r.UserId == userId);
        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(r => r.RegisteredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<EventRegistration>.Create(items, page, pageSize, total);
    }

    public async Task<IReadOnlyList<EventRegistration>> GetWaitlistAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(r => r.EventId == eventId && r.Status == RegistrationStatus.Waitlisted)
            .OrderBy(r => r.WaitlistPosition)
            .ThenBy(r => r.RegisteredAt)
            .ToListAsync(cancellationToken);

    public Task<int> CountByEventAndStatusAsync(
        Guid eventId,
        RegistrationStatus status,
        CancellationToken cancellationToken = default)
        => DbSet.CountAsync(r => r.EventId == eventId && r.Status == status, cancellationToken);

    public async Task<int> GetNextWaitlistPositionAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        var max = await DbSet
            .Where(r => r.EventId == eventId && r.Status == RegistrationStatus.Waitlisted)
            .MaxAsync(r => (int?)r.WaitlistPosition, cancellationToken);

        return (max ?? 0) + 1;
    }
}

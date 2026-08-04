using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class AttendanceRepository : Repository<AttendanceRecord>, IAttendanceRepository
{
    public AttendanceRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<AttendanceRecord?> GetCheckInAsync(
        Guid registrationId,
        CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(
            a => a.RegistrationId == registrationId && a.Type == AttendanceType.CheckIn,
            cancellationToken);

    public async Task<IReadOnlyList<AttendanceRecord>> GetByEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Include(a => a.User)
            .Where(a => a.EventId == eventId)
            .OrderByDescending(a => a.ScannedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<AttendanceRecord>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Include(a => a.Event)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.ScannedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<AttendanceRecord>> GetByRegistrationAsync(
        Guid registrationId,
        CancellationToken cancellationToken = default)
        => await DbSet
            .Where(a => a.RegistrationId == registrationId)
            .OrderBy(a => a.ScannedAt)
            .ToListAsync(cancellationToken);

    public Task<bool> HasCheckedInAsync(
        Guid registrationId,
        CancellationToken cancellationToken = default)
        => DbSet.AnyAsync(
            a => a.RegistrationId == registrationId && a.Type == AttendanceType.CheckIn,
            cancellationToken);

    public Task<int> CountByEventAndTypeAsync(
        Guid eventId,
        AttendanceType type,
        CancellationToken cancellationToken = default)
        => DbSet.CountAsync(a => a.EventId == eventId && a.Type == type, cancellationToken);

    public Task<int> CountLateByEventAsync(Guid eventId, CancellationToken cancellationToken = default)
        => DbSet.CountAsync(
            a => a.EventId == eventId && a.Type == AttendanceType.CheckIn && a.IsLate,
            cancellationToken);
}

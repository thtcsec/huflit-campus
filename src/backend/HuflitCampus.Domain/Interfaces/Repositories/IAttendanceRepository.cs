using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IAttendanceRepository : IRepository<AttendanceRecord>
{
    Task<AttendanceRecord?> GetCheckInAsync(
        Guid registrationId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AttendanceRecord>> GetByEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AttendanceRecord>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AttendanceRecord>> GetByRegistrationAsync(
        Guid registrationId,
        CancellationToken cancellationToken = default);
    Task<bool> HasCheckedInAsync(
        Guid registrationId,
        CancellationToken cancellationToken = default);
    Task<int> CountByEventAndTypeAsync(
        Guid eventId,
        AttendanceType type,
        CancellationToken cancellationToken = default);
    Task<int> CountLateByEventAsync(Guid eventId, CancellationToken cancellationToken = default);
}

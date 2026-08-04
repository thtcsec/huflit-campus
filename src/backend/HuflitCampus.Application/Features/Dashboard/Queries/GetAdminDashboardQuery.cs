using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Dashboard;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Dashboard.Queries;

public record GetAdminDashboardQuery : IRequest<Result<AdminDashboardDto>>;

public class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, Result<AdminDashboardDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IAttendanceRepository _attendanceRepository;

    public GetAdminDashboardQueryHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepository,
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        IAttendanceRepository attendanceRepository)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _attendanceRepository = attendanceRepository;
    }

    public async Task<Result<AdminDashboardDto>> Handle(
        GetAdminDashboardQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator))
            throw new ForbiddenException("Analytics access is restricted.");

        var totalUsers = await _userRepository.CountAsync(u => !u.IsDeleted, cancellationToken);
        var activeUsers = await _userRepository.CountAsync(u => !u.IsDeleted && u.IsActive, cancellationToken);
        var totalEvents = await _eventRepository.CountAsync(e => !e.IsDeleted, cancellationToken);
        var publishedEvents = await _eventRepository.CountAsync(
            e => !e.IsDeleted && e.Status == EventStatus.Published, cancellationToken);
        var pendingEvents = await _eventRepository.CountAsync(
            e => !e.IsDeleted && e.Status == EventStatus.PendingApproval, cancellationToken);
        var totalRegistrations = await _registrationRepository.CountAsync(r => !r.IsDeleted, cancellationToken);
        var totalAttendance = await _attendanceRepository.CountAsync(
            a => !a.IsDeleted && a.Type == AttendanceType.CheckIn, cancellationToken);

        var allEvents = _eventRepository.Query()
            .Where(e => !e.IsDeleted)
            .ToList();

        var topCategories = allEvents
            .GroupBy(e => e.Category)
            .Select(g => new CategoryCountDto
            {
                Category = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderByDescending(c => c.Count)
            .Take(5)
            .ToList();

        var topOrganizers = allEvents
            .GroupBy(e => e.OrganizerId)
            .Select(g => new
            {
                OrganizerId = g.Key,
                EventCount = g.Count(),
                TotalRegistrations = g.Sum(e => e.RegistrationCount),
                Name = g.Select(e => e.Organizer?.FullName).FirstOrDefault() ?? "Unknown"
            })
            .OrderByDescending(o => o.EventCount)
            .ThenByDescending(o => o.TotalRegistrations)
            .Take(5)
            .Select(o => new OrganizerStatsDto
            {
                OrganizerId = o.OrganizerId,
                OrganizerName = o.Name,
                EventCount = o.EventCount,
                TotalRegistrations = o.TotalRegistrations
            })
            .ToList();

        // Enrich organizer names if navigation not loaded
        for (var i = 0; i < topOrganizers.Count; i++)
        {
            if (topOrganizers[i].OrganizerName is "Unknown" or null or "")
            {
                var user = await _userRepository.GetByIdAsync(topOrganizers[i].OrganizerId, cancellationToken);
                if (user is not null)
                    topOrganizers[i].OrganizerName = user.FullName;
            }
        }

        var popularEvents = allEvents
            .OrderByDescending(e => e.RegistrationCount)
            .ThenByDescending(e => e.ViewCount)
            .Take(10)
            .Select(e => new PopularEventDto
            {
                EventId = e.Id,
                Title = e.Title,
                RegistrationCount = e.RegistrationCount,
                ViewCount = e.ViewCount,
                SaveCount = e.SaveCount
            })
            .ToList();

        return Result.Success(new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalEvents = totalEvents,
            PublishedEvents = publishedEvents,
            PendingApprovalEvents = pendingEvents,
            TotalRegistrations = totalRegistrations,
            TotalAttendance = totalAttendance,
            TopCategories = topCategories,
            TopOrganizers = topOrganizers,
            PopularEvents = popularEvents
        });
    }
}

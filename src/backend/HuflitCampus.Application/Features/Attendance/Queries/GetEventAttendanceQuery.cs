using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Attendance.Queries;

public record GetEventAttendanceQuery(Guid EventId) : IRequest<Result<IReadOnlyList<AttendanceDto>>>;

public class GetEventAttendanceQueryHandler
    : IRequestHandler<GetEventAttendanceQuery, Result<IReadOnlyList<AttendanceDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IMapper _mapper;

    public GetEventAttendanceQueryHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IAttendanceRepository attendanceRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _attendanceRepository = attendanceRepository;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<AttendanceDto>>> Handle(
        GetEventAttendanceQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var evt = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var isOwner = evt.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException();

        var records = await _attendanceRepository.GetByEventAsync(request.EventId, cancellationToken);
        return Result.Success<IReadOnlyList<AttendanceDto>>(_mapper.Map<List<AttendanceDto>>(records));
    }
}

using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Queries;

public record GetUserAttendanceHistoryQuery(Guid? UserId = null) : IRequest<Result<IReadOnlyList<AttendanceDto>>>;

public class GetUserAttendanceHistoryQueryHandler
    : IRequestHandler<GetUserAttendanceHistoryQuery, Result<IReadOnlyList<AttendanceDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IMapper _mapper;

    public GetUserAttendanceHistoryQueryHandler(
        ICurrentUserService currentUser,
        IAttendanceRepository attendanceRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _attendanceRepository = attendanceRepository;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<AttendanceDto>>> Handle(
        GetUserAttendanceHistoryQuery request,
        CancellationToken cancellationToken)
    {
        var targetUserId = request.UserId ?? _currentUser.UserId;
        if (targetUserId is null)
            throw new UnauthorizedAppException();

        if (request.UserId.HasValue
            && request.UserId != _currentUser.UserId
            && !_currentUser.IsInAnyRole(
                Domain.Enums.UserRole.Administrator,
                Domain.Enums.UserRole.FacultyManager))
        {
            throw new ForbiddenException();
        }

        var records = await _attendanceRepository.GetByUserAsync(targetUserId.Value, cancellationToken);
        return Result.Success<IReadOnlyList<AttendanceDto>>(_mapper.Map<List<AttendanceDto>>(records));
    }
}

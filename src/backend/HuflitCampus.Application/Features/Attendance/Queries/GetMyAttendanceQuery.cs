using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Attendance.Queries;

public record GetMyAttendanceQuery : IRequest<Result<IReadOnlyList<AttendanceDto>>>;

public class GetMyAttendanceQueryHandler
    : IRequestHandler<GetMyAttendanceQuery, Result<IReadOnlyList<AttendanceDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IMapper _mapper;

    public GetMyAttendanceQueryHandler(
        ICurrentUserService currentUser,
        IAttendanceRepository attendanceRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _attendanceRepository = attendanceRepository;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<AttendanceDto>>> Handle(
        GetMyAttendanceQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var records = await _attendanceRepository.GetByUserAsync(_currentUser.UserId.Value, cancellationToken);
        return Result.Success<IReadOnlyList<AttendanceDto>>(_mapper.Map<List<AttendanceDto>>(records));
    }
}

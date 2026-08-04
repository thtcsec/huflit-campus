using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Attendance.Commands;

public record CheckOutCommand(CheckOutRequest Request) : IRequest<Result<AttendanceDto>>;

public class CheckOutCommandHandler : IRequestHandler<CheckOutCommand, Result<AttendanceDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IQrTokenRepository _qrTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public CheckOutCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        IAttendanceRepository attendanceRepository,
        IQrTokenRepository qrTokenRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IDateTimeProvider dateTime)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _attendanceRepository = attendanceRepository;
        _qrTokenRepository = qrTokenRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _dateTime = dateTime;
    }

    public async Task<Result<AttendanceDto>> Handle(CheckOutCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var userId = _currentUser.UserId.Value;
        var evt = await _eventRepository.GetByIdAsync(request.Request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.Request.EventId);

        var qr = await _qrTokenRepository.GetByTokenAsync(request.Request.QrToken, cancellationToken);
        if (qr is null || qr.EventId != evt.Id || !qr.IsValid)
            return Result.Failure<AttendanceDto>("Invalid or expired QR token.");

        var registration = await _registrationRepository.GetByEventAndUserAsync(evt.Id, userId, cancellationToken);
        if (registration is null)
            return Result.Failure<AttendanceDto>("Registration not found.");

        if (!await _attendanceRepository.HasCheckedInAsync(registration.Id, cancellationToken))
            return Result.Failure<AttendanceDto>("You must check in before checking out.");

        var existingRecords = await _attendanceRepository.GetByRegistrationAsync(registration.Id, cancellationToken);
        if (existingRecords.Any(r => r.Type == AttendanceType.CheckOut))
            throw new ConflictException("You have already checked out.");

        var markUsed = qr.MarkUsed();
        if (markUsed.IsFailure)
            return Result.Failure<AttendanceDto>(markUsed.Error!);

        var now = _dateTime.UtcNow;
        var status = now < evt.EndAt ? AttendanceStatus.EarlyLeave : AttendanceStatus.Valid;

        var record = AttendanceRecord.CreateCheckOut(
            registration.Id,
            evt.Id,
            userId,
            status,
            qr.Id,
            request.Request.DeviceInfo);

        _qrTokenRepository.Update(qr);
        _attendanceRepository.Add(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<AttendanceDto>(record));
    }
}

using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;
using AppNotificationPublisher = HuflitCampus.Application.Common.Interfaces.INotificationPublisher;

namespace HuflitCampus.Application.Features.Attendance.Commands;

public record CheckInCommand(CheckInRequest Request) : IRequest<Result<AttendanceDto>>;

public class CheckInCommandHandler : IRequestHandler<CheckInCommand, Result<AttendanceDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IQrTokenRepository _qrTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;
    private readonly IDateTimeProvider _dateTime;

    public CheckInCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        IAttendanceRepository attendanceRepository,
        IQrTokenRepository qrTokenRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        AppNotificationPublisher notificationPublisher,
        IDateTimeProvider dateTime)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _attendanceRepository = attendanceRepository;
        _qrTokenRepository = qrTokenRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationPublisher = notificationPublisher;
        _dateTime = dateTime;
    }

    public async Task<Result<AttendanceDto>> Handle(CheckInCommand request, CancellationToken cancellationToken)
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
        if (registration is null || registration.Status != RegistrationStatus.Approved)
        {
            return Result.Failure<AttendanceDto>("You must have an approved registration to check in.");
        }

        if (await _attendanceRepository.HasCheckedInAsync(registration.Id, cancellationToken))
            throw new ConflictException("You have already checked in.");

        var now = _dateTime.UtcNow;
        if (evt.CheckInStart.HasValue && now < evt.CheckInStart.Value)
            return Result.Failure<AttendanceDto>("Check-in has not started yet.");

        if (evt.CheckInEnd.HasValue && now > evt.CheckInEnd.Value)
            return Result.Failure<AttendanceDto>("Check-in window has closed.");

        var isLate = evt.StartAt < now;
        var status = isLate ? AttendanceStatus.Late : AttendanceStatus.OnTime;

        var markUsed = qr.MarkUsed();
        if (markUsed.IsFailure)
            return Result.Failure<AttendanceDto>(markUsed.Error!);

        var record = AttendanceRecord.CreateCheckIn(
            registration.Id,
            evt.Id,
            userId,
            status,
            qr.Id,
            request.Request.DeviceInfo,
            isLate);

        registration.MarkAttended();

        _qrTokenRepository.Update(qr);
        _attendanceRepository.Add(record);
        _registrationRepository.Update(registration);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationPublisher.PublishAsync(
            Notification.Create(
                userId,
                NotificationType.AttendanceConfirmed,
                "Check-in confirmed",
                $"You have checked in to \"{evt.Title}\"."),
            cancellationToken);

        return Result.Success(_mapper.Map<AttendanceDto>(record));
    }
}

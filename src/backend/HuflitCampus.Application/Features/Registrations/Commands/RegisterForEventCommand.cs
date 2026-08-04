using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Registrations;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;
using AppNotificationPublisher = HuflitCampus.Application.Common.Interfaces.INotificationPublisher;

namespace HuflitCampus.Application.Features.Registrations.Commands;

public record RegisterForEventCommand(Guid EventId, RegisterEventRequest Request) : IRequest<Result<RegistrationDto>>;

public class RegisterForEventCommandHandler : IRequestHandler<RegisterForEventCommand, Result<RegistrationDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;
    private readonly IDateTimeProvider _dateTime;

    public RegisterForEventCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        AppNotificationPublisher notificationPublisher,
        IDateTimeProvider dateTime)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationPublisher = notificationPublisher;
        _dateTime = dateTime;
    }

    public async Task<Result<RegistrationDto>> Handle(RegisterForEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var userId = _currentUser.UserId.Value;
        var evt = await _eventRepository.GetWithDetailsAsync(request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var canRegister = evt.CanRegister(_dateTime.UtcNow);
        if (canRegister.IsFailure)
            return Result.Failure<RegistrationDto>(canRegister.Error!);

        var existing = await _registrationRepository.GetByEventAndUserAsync(evt.Id, userId, cancellationToken);
        if (existing is not null && existing.Status is not (RegistrationStatus.Cancelled or RegistrationStatus.Rejected))
            throw new ConflictException("You are already registered for this event.");

        EventRegistration registration;
        if (existing is not null)
        {
            registration = existing;
            registration.Status = RegistrationStatus.Pending;
            registration.RegisteredAt = _dateTime.UtcNow;
            registration.Notes = request.Request.Notes;
            registration.WaitlistPosition = null;
            registration.ApprovedAt = null;
            registration.IsDeleted = false;
            _registrationRepository.Update(registration);
        }
        else
        {
            registration = EventRegistration.Create(evt.Id, userId, notes: request.Request.Notes);
            _registrationRepository.Add(registration);
        }

        if (evt.HasAvailableSeats)
        {
            var approve = registration.Approve();
            if (approve.IsFailure)
                return Result.Failure<RegistrationDto>(approve.Error!);

            evt.IncrementRegistrationCount();
        }
        else if (evt.WaitlistEnabled)
        {
            var position = await _registrationRepository.GetNextWaitlistPositionAsync(evt.Id, cancellationToken);
            var waitlist = registration.MoveToWaitlist(position);
            if (waitlist.IsFailure)
                return Result.Failure<RegistrationDto>(waitlist.Error!);
        }
        else
        {
            return Result.Failure<RegistrationDto>("Event is at full capacity.");
        }

        _eventRepository.Update(evt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var notificationType = registration.Status == RegistrationStatus.Waitlisted
            ? NotificationType.EventUpdated
            : NotificationType.RegistrationApproved;

        await _notificationPublisher.PublishAsync(
            Notification.Create(
                userId,
                notificationType,
                registration.Status == RegistrationStatus.Waitlisted
                    ? "Added to waitlist"
                    : "Registration confirmed",
                registration.Status == RegistrationStatus.Waitlisted
                    ? $"You are #{registration.WaitlistPosition} on the waitlist for \"{evt.Title}\"."
                    : $"You are registered for \"{evt.Title}\"."),
            cancellationToken);

        var detailed = await _registrationRepository.GetWithDetailsAsync(registration.Id, cancellationToken)
                       ?? registration;

        return Result.Success(_mapper.Map<RegistrationDto>(detailed));
    }
}

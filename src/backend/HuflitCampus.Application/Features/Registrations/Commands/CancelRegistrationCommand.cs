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

public record CancelRegistrationCommand(Guid RegistrationId) : IRequest<Result<RegistrationDto>>;

public class CancelRegistrationCommandHandler : IRequestHandler<CancelRegistrationCommand, Result<RegistrationDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;

    public CancelRegistrationCommandHandler(
        ICurrentUserService currentUser,
        IRegistrationRepository registrationRepository,
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        AppNotificationPublisher notificationPublisher)
    {
        _currentUser = currentUser;
        _registrationRepository = registrationRepository;
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationPublisher = notificationPublisher;
    }

    public async Task<Result<RegistrationDto>> Handle(CancelRegistrationCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var registration = await _registrationRepository.GetWithDetailsAsync(request.RegistrationId, cancellationToken);
        if (registration is null || registration.IsDeleted)
            throw new NotFoundException(nameof(EventRegistration), request.RegistrationId);

        if (registration.UserId != _currentUser.UserId
            && !_currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator))
            throw new ForbiddenException();

        var wasApproved = registration.Status == RegistrationStatus.Approved;
        var cancel = registration.Cancel();
        if (cancel.IsFailure)
            return Result.Failure<RegistrationDto>(cancel.Error!);

        var evt = await _eventRepository.GetByIdAsync(registration.EventId, cancellationToken);
        if (evt is not null && wasApproved)
        {
            evt.DecrementRegistrationCount();
            _eventRepository.Update(evt);

            await PromoteFromWaitlistAsync(evt, cancellationToken);
        }

        _registrationRepository.Update(registration);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<RegistrationDto>(registration));
    }

    private async Task PromoteFromWaitlistAsync(Event evt, CancellationToken cancellationToken)
    {
        if (!evt.HasAvailableSeats)
            return;

        var waitlist = await _registrationRepository.GetWaitlistAsync(evt.Id, cancellationToken);
        var next = waitlist.OrderBy(r => r.WaitlistPosition).FirstOrDefault();
        if (next is null)
            return;

        var approve = next.Approve();
        if (approve.IsFailure)
            return;

        evt.IncrementRegistrationCount();
        _registrationRepository.Update(next);

        await _notificationPublisher.PublishAsync(
            Notification.Create(
                next.UserId,
                NotificationType.RegistrationApproved,
                "Waitlist promoted",
                $"A seat opened for \"{evt.Title}\". Your registration is now confirmed."),
            cancellationToken);
    }
}

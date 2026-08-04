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

public record ApproveRegistrationCommand(Guid RegistrationId) : IRequest<Result<RegistrationDto>>;

public class ApproveRegistrationCommandHandler : IRequestHandler<ApproveRegistrationCommand, Result<RegistrationDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;

    public ApproveRegistrationCommandHandler(
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

    public async Task<Result<RegistrationDto>> Handle(ApproveRegistrationCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var registration = await _registrationRepository.GetWithDetailsAsync(request.RegistrationId, cancellationToken);
        if (registration is null || registration.IsDeleted)
            throw new NotFoundException(nameof(EventRegistration), request.RegistrationId);

        var evt = await _eventRepository.GetByIdAsync(registration.EventId, cancellationToken)
                  ?? throw new NotFoundException(nameof(Event), registration.EventId);

        EnsureCanManage(evt);

        if (!evt.HasAvailableSeats && registration.Status != RegistrationStatus.Waitlisted)
            return Result.Failure<RegistrationDto>("Event is at full capacity.");

        var wasCounting = registration.Status == RegistrationStatus.Approved;
        var result = registration.Approve();
        if (result.IsFailure)
            return Result.Failure<RegistrationDto>(result.Error!);

        if (!wasCounting)
        {
            evt.IncrementRegistrationCount();
            _eventRepository.Update(evt);
        }

        _registrationRepository.Update(registration);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationPublisher.PublishAsync(
            Notification.Create(
                registration.UserId,
                NotificationType.RegistrationApproved,
                "Registration approved",
                $"Your registration for \"{evt.Title}\" has been approved."),
            cancellationToken);

        return Result.Success(_mapper.Map<RegistrationDto>(registration));
    }

    private void EnsureCanManage(Event evt)
    {
        var isOwner = evt.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException();
    }
}

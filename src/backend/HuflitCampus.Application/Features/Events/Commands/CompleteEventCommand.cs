using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;
using AppNotificationPublisher = HuflitCampus.Application.Common.Interfaces.INotificationPublisher;

namespace HuflitCampus.Application.Features.Events.Commands;

public record CompleteEventCommand(Guid EventId) : IRequest<Result<EventDetailDto>>;

public class CompleteEventCommandHandler : IRequestHandler<CompleteEventCommand, Result<EventDetailDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;
    private readonly IRegistrationRepository _registrationRepository;

    public CompleteEventCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        AppNotificationPublisher notificationPublisher,
        IRegistrationRepository registrationRepository)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationPublisher = notificationPublisher;
        _registrationRepository = registrationRepository;
    }

    public async Task<Result<EventDetailDto>> Handle(CompleteEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var entity = await _eventRepository.GetWithDetailsAsync(request.EventId, cancellationToken);
        if (entity is null || entity.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var isOwner = entity.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException();

        var result = entity.MarkCompleted();
        if (result.IsFailure)
            return Result.Failure<EventDetailDto>(result.Error!);

        _eventRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var registrations = await _registrationRepository.GetByEventAsync(
            entity.Id, 1, 500, cancellationToken: cancellationToken);

        var notifications = registrations.Items
            .Where(r => r.Status is RegistrationStatus.Approved or RegistrationStatus.Attended)
            .Select(r => Notification.Create(
                r.UserId,
                NotificationType.EventReminder,
                "Event completed",
                $"Thank you for participating in \"{entity.Title}\"!"))
            .ToList();

        if (notifications.Count > 0)
            await _notificationPublisher.PublishManyAsync(notifications, cancellationToken);

        return Result.Success(_mapper.Map<EventDetailDto>(entity));
    }
}

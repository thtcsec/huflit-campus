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

public record ApproveEventCommand(Guid EventId, ApproveEventRequest? Request = null) : IRequest<Result<EventDetailDto>>;

public class ApproveEventCommandHandler : IRequestHandler<ApproveEventCommand, Result<EventDetailDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;

    public ApproveEventCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        AppNotificationPublisher notificationPublisher)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationPublisher = notificationPublisher;
    }

    public async Task<Result<EventDetailDto>> Handle(ApproveEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator))
            throw new ForbiddenException("Only faculty managers or administrators can approve events.");

        var entity = await _eventRepository.GetWithDetailsAsync(request.EventId, cancellationToken);
        if (entity is null || entity.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var result = entity.Approve(_currentUser.UserId.Value);
        if (result.IsFailure)
            return Result.Failure<EventDetailDto>(result.Error!);

        _eventRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationPublisher.PublishAsync(
            Notification.Create(
                entity.OrganizerId,
                NotificationType.EventUpdated,
                "Event approved",
                $"Your event \"{entity.Title}\" has been approved."),
            cancellationToken);

        return Result.Success(_mapper.Map<EventDetailDto>(entity));
    }
}

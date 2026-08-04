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

public record RejectEventCommand(Guid EventId, RejectEventRequest Request) : IRequest<Result<EventDetailDto>>;

public class RejectEventCommandHandler : IRequestHandler<RejectEventCommand, Result<EventDetailDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly AppNotificationPublisher _notificationPublisher;

    public RejectEventCommandHandler(
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

    public async Task<Result<EventDetailDto>> Handle(RejectEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator))
            throw new ForbiddenException("Only faculty managers or administrators can reject events.");

        var entity = await _eventRepository.GetWithDetailsAsync(request.EventId, cancellationToken);
        if (entity is null || entity.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var result = entity.Reject(request.Request.Reason);
        if (result.IsFailure)
            return Result.Failure<EventDetailDto>(result.Error!);

        _eventRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _notificationPublisher.PublishAsync(
            Notification.Create(
                entity.OrganizerId,
                NotificationType.EventUpdated,
                "Event rejected",
                $"Your event \"{entity.Title}\" was rejected: {request.Request.Reason}"),
            cancellationToken);

        return Result.Success(_mapper.Map<EventDetailDto>(entity));
    }
}

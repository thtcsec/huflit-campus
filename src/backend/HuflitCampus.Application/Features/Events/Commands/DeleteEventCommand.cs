using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Commands;

public record DeleteEventCommand(Guid EventId) : IRequest<Result>;

public class DeleteEventCommandHandler : IRequestHandler<DeleteEventCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEventCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var entity = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (entity is null || entity.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var isOwner = entity.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException("You cannot delete this event.");

        if (entity.Status is EventStatus.Published or EventStatus.RegistrationClosed)
            return Result.Failure("Published events cannot be deleted. Cancel the event instead.");

        entity.SoftDelete(_currentUser.UserId.Value.ToString());
        _eventRepository.SoftDelete(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

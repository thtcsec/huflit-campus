using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Notifications.Commands;

public record MarkNotificationReadCommand(Guid NotificationId) : IRequest<Result>;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkNotificationReadCommandHandler(
        ICurrentUserService currentUser,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var notification = await _notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification is null || notification.IsDeleted)
            throw new NotFoundException(nameof(Notification), request.NotificationId);

        if (notification.UserId != _currentUser.UserId)
            throw new ForbiddenException();

        notification.MarkAsRead();
        _notificationRepository.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

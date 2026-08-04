using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Notifications.Commands;

public record MarkAllNotificationsReadCommand : IRequest<Result>;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkAllNotificationsReadCommandHandler(
        ICurrentUserService currentUser,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        await _notificationRepository.MarkAllAsReadAsync(_currentUser.UserId.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

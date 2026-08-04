using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Notifications;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Notifications.Queries;

public record GetMyNotificationsQuery(
    int Page = 1,
    int PageSize = 20,
    bool UnreadOnly = false) : IRequest<Result<PagedResult<NotificationDto>>>;

public class GetMyNotificationsQueryHandler
    : IRequestHandler<GetMyNotificationsQuery, Result<PagedResult<NotificationDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationRepository _notificationRepository;
    private readonly IMapper _mapper;

    public GetMyNotificationsQueryHandler(
        ICurrentUserService currentUser,
        INotificationRepository notificationRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<NotificationDto>>> Handle(
        GetMyNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 20 : request.PageSize;

        var paged = await _notificationRepository.GetByUserAsync(
            _currentUser.UserId.Value, page, pageSize, request.UnreadOnly, cancellationToken);

        var items = _mapper.Map<List<NotificationDto>>(paged.Items);
        return Result.Success(PagedResult<NotificationDto>.Create(items, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

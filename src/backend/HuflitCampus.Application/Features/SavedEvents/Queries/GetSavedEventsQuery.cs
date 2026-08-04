using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.SavedEvents.Queries;

public record GetSavedEventsQuery(int Page = 1, int PageSize = 10) : IRequest<Result<PagedResult<EventListItemDto>>>;

public class GetSavedEventsQueryHandler
    : IRequestHandler<GetSavedEventsQuery, Result<PagedResult<EventListItemDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly ISavedEventRepository _savedEventRepository;
    private readonly IMapper _mapper;

    public GetSavedEventsQueryHandler(
        ICurrentUserService currentUser,
        ISavedEventRepository savedEventRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _savedEventRepository = savedEventRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<EventListItemDto>>> Handle(
        GetSavedEventsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 10 : request.PageSize;

        var paged = await _savedEventRepository.GetByUserAsync(
            _currentUser.UserId.Value, page, pageSize, cancellationToken);

        var events = paged.Items
            .Where(s => s.Event is not null && !s.Event.IsDeleted)
            .Select(s => s.Event!)
            .ToList();

        var items = _mapper.Map<List<EventListItemDto>>(events);
        foreach (var item in items)
            item.IsSaved = true;

        return Result.Success(PagedResult<EventListItemDto>.Create(items, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

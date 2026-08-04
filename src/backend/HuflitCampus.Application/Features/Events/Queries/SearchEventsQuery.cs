using AutoMapper;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Queries;

public record SearchEventsQuery(EventSearchRequest Request) : IRequest<Result<PagedResult<EventListItemDto>>>;

public class SearchEventsQueryHandler : IRequestHandler<SearchEventsQuery, Result<PagedResult<EventListItemDto>>>
{
    private readonly IEventRepository _eventRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public SearchEventsQueryHandler(
        IEventRepository eventRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _eventRepository = eventRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<EventListItemDto>>> Handle(
        SearchEventsQuery request,
        CancellationToken cancellationToken)
    {
        var req = request.Request;
        var page = req.Page < 1 ? 1 : req.Page;
        var pageSize = req.PageSize is < 1 or > 100 ? 10 : req.PageSize;

        PagedResult<Domain.Entities.Event> paged;

        if (req.Status.HasValue
            && _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator, UserRole.ClubManager, UserRole.Lecturer))
        {
            paged = await _eventRepository.GetByStatusAsync(req.Status.Value, page, pageSize, cancellationToken);
        }
        else if (req.OrganizerId.HasValue)
        {
            var events = await _eventRepository.GetByOrganizerAsync(req.OrganizerId.Value, cancellationToken);
            var filtered = events.AsEnumerable();

            if (req.Category.HasValue)
                filtered = filtered.Where(e => e.Category == req.Category);
            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                var term = req.Search.Trim();
                filtered = filtered.Where(e =>
                    e.Title.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || e.Description.Contains(term, StringComparison.OrdinalIgnoreCase));
            }

            var list = filtered.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            paged = PagedResult<Domain.Entities.Event>.Create(list, page, pageSize, filtered.Count());
        }
        else
        {
            paged = await _eventRepository.GetPublishedAsync(
                page,
                pageSize,
                req.Category,
                req.Faculty,
                req.Search,
                cancellationToken);
        }

        if (req.FeaturedOnly == true)
        {
            var featured = paged.Items.Where(e => e.IsFeatured).ToList();
            paged = PagedResult<Domain.Entities.Event>.Create(featured, page, pageSize, featured.Count);
        }

        if (req.From.HasValue || req.To.HasValue)
        {
            var filtered = paged.Items.AsEnumerable();
            if (req.From.HasValue)
                filtered = filtered.Where(e => e.StartAt >= req.From.Value);
            if (req.To.HasValue)
                filtered = filtered.Where(e => e.StartAt <= req.To.Value);

            var list = filtered.ToList();
            paged = PagedResult<Domain.Entities.Event>.Create(list, page, pageSize, list.Count);
        }

        var items = _mapper.Map<List<EventListItemDto>>(paged.Items);
        return Result.Success(PagedResult<EventListItemDto>.Create(items, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

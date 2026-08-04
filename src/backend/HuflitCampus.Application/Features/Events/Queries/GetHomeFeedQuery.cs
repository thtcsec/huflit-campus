using AutoMapper;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Queries;

public record GetHomeFeedQuery(int Take = 8) : IRequest<Result<HomeFeedDto>>;

public class GetHomeFeedQueryHandler : IRequestHandler<GetHomeFeedQuery, Result<HomeFeedDto>>
{
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;
    private readonly IMapper _mapper;

    public GetHomeFeedQueryHandler(
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTime,
        IMapper mapper)
    {
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _currentUser = currentUser;
        _dateTime = dateTime;
        _mapper = mapper;
    }

    public async Task<Result<HomeFeedDto>> Handle(GetHomeFeedQuery request, CancellationToken cancellationToken)
    {
        var take = request.Take is < 1 or > 30 ? 8 : request.Take;
        var now = _dateTime.UtcNow;
        var startOfDay = now.Date;
        var endOfDay = startOfDay.AddDays(1);

        var todayEvents = await _eventRepository.GetUpcomingAsync(startOfDay, endOfDay, cancellationToken);
        var upcoming = await _eventRepository.GetUpcomingAsync(now, now.AddDays(30), cancellationToken);
        var featured = await _eventRepository.GetFeaturedAsync(take, cancellationToken);
        var published = await _eventRepository.GetPublishedAsync(1, 50, cancellationToken: cancellationToken);

        var publishedItems = published.Items
            .Where(e => e.Status is EventStatus.Published or EventStatus.RegistrationClosed)
            .ToList();

        var trending = publishedItems
            .OrderByDescending(e => e.ViewCount + e.RegistrationCount * 3 + e.SaveCount * 2)
            .Take(take)
            .ToList();

        var recent = publishedItems
            .OrderByDescending(e => e.PublishedAt ?? e.CreatedAt)
            .Take(take)
            .ToList();

        var recommended = await BuildRecommendedAsync(publishedItems, take, cancellationToken);

        return Result.Success(new HomeFeedDto
        {
            Featured = _mapper.Map<List<EventListItemDto>>(featured.Take(take)),
            Today = _mapper.Map<List<EventListItemDto>>(todayEvents.Take(take)),
            Trending = _mapper.Map<List<EventListItemDto>>(trending),
            Upcoming = _mapper.Map<List<EventListItemDto>>(
                upcoming.Where(e => e.StartAt > endOfDay).Take(take)),
            Recent = _mapper.Map<List<EventListItemDto>>(recent),
            Recommended = _mapper.Map<List<EventListItemDto>>(recommended)
        });
    }

    private async Task<List<Domain.Entities.Event>> BuildRecommendedAsync(
        List<Domain.Entities.Event> pool,
        int take,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return pool.Where(e => e.IsFeatured).Take(take).ToList();

        var myRegs = await _registrationRepository.GetByUserAsync(
            _currentUser.UserId.Value, 1, 50, cancellationToken: cancellationToken);

        var preferredCategories = myRegs.Items
            .Where(r => r.Event is not null)
            .Select(r => r.Event!.Category)
            .GroupBy(c => c)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .Take(3)
            .ToHashSet();

        if (preferredCategories.Count == 0)
            return pool.Where(e => e.IsFeatured).Take(take).ToList();

        return pool
            .Where(e => preferredCategories.Contains(e.Category))
            .OrderBy(e => e.StartAt)
            .Take(take)
            .ToList();
    }
}

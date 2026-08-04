using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Queries;

public record GetRelatedEventsQuery(Guid EventId, int Take = 6) : IRequest<Result<IReadOnlyList<EventListItemDto>>>;

public class GetRelatedEventsQueryHandler
    : IRequestHandler<GetRelatedEventsQuery, Result<IReadOnlyList<EventListItemDto>>>
{
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;

    public GetRelatedEventsQueryHandler(IEventRepository eventRepository, IMapper mapper)
    {
        _eventRepository = eventRepository;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<EventListItemDto>>> Handle(
        GetRelatedEventsQuery request,
        CancellationToken cancellationToken)
    {
        var source = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (source is null || source.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var take = request.Take is < 1 or > 20 ? 6 : request.Take;
        var published = await _eventRepository.GetPublishedAsync(
            1, 40, source.Category, source.Faculty, cancellationToken: cancellationToken);

        var related = published.Items
            .Where(e => e.Id != source.Id
                        && e.Status is EventStatus.Published or EventStatus.RegistrationClosed)
            .OrderBy(e => e.StartAt)
            .Take(take)
            .ToList();

        return Result.Success<IReadOnlyList<EventListItemDto>>(_mapper.Map<List<EventListItemDto>>(related));
    }
}

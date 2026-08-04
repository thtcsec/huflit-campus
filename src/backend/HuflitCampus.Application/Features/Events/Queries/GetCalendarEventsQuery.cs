using AutoMapper;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Calendar;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Queries;

public record GetCalendarEventsQuery(DateTime From, DateTime To) : IRequest<Result<IReadOnlyList<CalendarEventDto>>>;

public class GetCalendarEventsQueryHandler
    : IRequestHandler<GetCalendarEventsQuery, Result<IReadOnlyList<CalendarEventDto>>>
{
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetCalendarEventsQueryHandler(
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<Result<IReadOnlyList<CalendarEventDto>>> Handle(
        GetCalendarEventsQuery request,
        CancellationToken cancellationToken)
    {
        if (request.To < request.From)
            return Result.Failure<IReadOnlyList<CalendarEventDto>>("Invalid date range.");

        var events = await _eventRepository.GetUpcomingAsync(request.From, request.To, cancellationToken);
        var visible = events
            .Where(e => e.Status is EventStatus.Published or EventStatus.RegistrationClosed or EventStatus.Completed)
            .ToList();

        var dtos = _mapper.Map<List<CalendarEventDto>>(visible);

        if (_currentUser.UserId is Guid userId)
        {
            var regs = await _registrationRepository.GetByUserAsync(userId, 1, 200, cancellationToken: cancellationToken);
            var registeredIds = regs.Items
                .Where(r => r.Status is not (RegistrationStatus.Cancelled or RegistrationStatus.Rejected))
                .Select(r => r.EventId)
                .ToHashSet();

            foreach (var dto in dtos)
                dto.IsRegistered = registeredIds.Contains(dto.Id);
        }

        return Result.Success<IReadOnlyList<CalendarEventDto>>(dtos);
    }
}

using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Queries;

public record GetEventByIdQuery(Guid EventId) : IRequest<Result<EventDetailDto>>;

public class GetEventByIdQueryHandler : IRequestHandler<GetEventByIdQuery, Result<EventDetailDto>>
{
    private readonly IEventRepository _eventRepository;
    private readonly ISavedEventRepository _savedEventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetEventByIdQueryHandler(
        IEventRepository eventRepository,
        ISavedEventRepository savedEventRepository,
        IRegistrationRepository registrationRepository,
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _eventRepository = eventRepository;
        _savedEventRepository = savedEventRepository;
        _registrationRepository = registrationRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<EventDetailDto>> Handle(GetEventByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _eventRepository.GetWithDetailsAsync(request.EventId, cancellationToken);
        if (entity is null || entity.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        entity.IncrementViewCount();
        _eventRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<EventDetailDto>(entity);

        if (_currentUser.UserId is Guid userId)
        {
            dto.IsSaved = await _savedEventRepository.IsSavedAsync(userId, entity.Id, cancellationToken);
            dto.IsRegistered = await _registrationRepository.HasRegisteredAsync(entity.Id, userId, cancellationToken);
        }

        return Result.Success(dto);
    }
}

using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Registrations;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Registrations.Queries;

public record GetEventRegistrationsQuery(
    Guid EventId,
    int Page = 1,
    int PageSize = 20,
    RegistrationStatus? Status = null) : IRequest<Result<PagedResult<RegistrationDto>>>;

public class GetEventRegistrationsQueryHandler
    : IRequestHandler<GetEventRegistrationsQuery, Result<PagedResult<RegistrationDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IMapper _mapper;

    public GetEventRegistrationsQueryHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<RegistrationDto>>> Handle(
        GetEventRegistrationsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var evt = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var isOwner = evt.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException();

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 20 : request.PageSize;

        var paged = await _registrationRepository.GetByEventAsync(
            request.EventId, page, pageSize, request.Status, cancellationToken);

        var items = _mapper.Map<List<RegistrationDto>>(paged.Items);
        return Result.Success(PagedResult<RegistrationDto>.Create(items, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

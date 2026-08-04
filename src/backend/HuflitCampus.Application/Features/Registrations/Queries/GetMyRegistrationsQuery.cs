using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Registrations;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Registrations.Queries;

public record GetMyRegistrationsQuery(
    int Page = 1,
    int PageSize = 10,
    RegistrationStatus? Status = null) : IRequest<Result<PagedResult<RegistrationDto>>>;

public class GetMyRegistrationsQueryHandler
    : IRequestHandler<GetMyRegistrationsQuery, Result<PagedResult<RegistrationDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IRegistrationRepository _registrationRepository;
    private readonly IMapper _mapper;

    public GetMyRegistrationsQueryHandler(
        ICurrentUserService currentUser,
        IRegistrationRepository registrationRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _registrationRepository = registrationRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<RegistrationDto>>> Handle(
        GetMyRegistrationsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 10 : request.PageSize;

        var paged = await _registrationRepository.GetByUserAsync(
            _currentUser.UserId.Value, page, pageSize, request.Status, cancellationToken);

        var items = _mapper.Map<List<RegistrationDto>>(paged.Items);
        return Result.Success(PagedResult<RegistrationDto>.Create(items, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

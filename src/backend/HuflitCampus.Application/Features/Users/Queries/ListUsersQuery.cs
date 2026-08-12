using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Queries;

public record ListUsersQuery(
    string? Search = null,
    UserRole? Role = null,
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 50) : IRequest<Result<PagedResult<UserProfileDto>>>;

public class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, Result<PagedResult<UserProfileDto>>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public ListUsersQueryHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<UserProfileDto>>> Handle(
        ListUsersQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInRole(UserRole.Administrator))
            throw new ForbiddenException("Only administrators can manage users.");

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 50 : request.PageSize;

        var paged = await _userRepository.SearchAdminAsync(
            request.Search,
            request.Role,
            request.IsActive,
            page,
            pageSize,
            cancellationToken);

        var dtos = _mapper.Map<IReadOnlyList<UserProfileDto>>(paged.Items);
        return Result.Success(PagedResult<UserProfileDto>.Create(dtos, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

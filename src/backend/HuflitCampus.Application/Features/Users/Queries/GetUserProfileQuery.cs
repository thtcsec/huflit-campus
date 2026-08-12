using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Queries;

public record GetUserProfileQuery(Guid UserId) : IRequest<Result<UserProfileDto>>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetUserProfileQueryHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var isSelf = _currentUser.UserId.Value == request.UserId;
        var canManageUsers = _currentUser.IsInRole(UserRole.Administrator);

        if (!isSelf && !canManageUsers)
            throw new ForbiddenException("You can only view your own profile.");

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), request.UserId);

        return Result.Success(_mapper.Map<UserProfileDto>(user));
    }
}

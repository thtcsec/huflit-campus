using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Auth.Queries;

public record GetCurrentUserQuery : IRequest<Result<UserProfileDto>>;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserProfileDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetCurrentUserQueryHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<Result<UserProfileDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var user = await _userRepository.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), _currentUser.UserId.Value);

        return Result.Success(_mapper.Map<UserProfileDto>(user));
    }
}

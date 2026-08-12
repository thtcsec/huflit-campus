using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Commands;

public record SetUserActiveCommand(Guid UserId, bool IsActive) : IRequest<Result<UserProfileDto>>;

public class SetUserActiveCommandHandler : IRequestHandler<SetUserActiveCommand, Result<UserProfileDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SetUserActiveCommandHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<UserProfileDto>> Handle(
        SetUserActiveCommand request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInRole(UserRole.Administrator))
            throw new ForbiddenException("Only administrators can activate or deactivate users.");

        var user = await _userRepository.GetWithRefreshTokensAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), request.UserId);

        if (user.Id == _currentUser.UserId.Value && !request.IsActive)
            return Result.Failure<UserProfileDto>("You cannot deactivate your own account.");

        if (user.Role == UserRole.Administrator && !request.IsActive)
        {
            var adminCount = await _userRepository.CountAsync(
                u => !u.IsDeleted && u.IsActive && u.Role == UserRole.Administrator,
                cancellationToken);
            if (adminCount <= 1)
                return Result.Failure<UserProfileDto>("Cannot deactivate the last active administrator.");
        }

        if (request.IsActive)
            user.Activate();
        else
        {
            user.Deactivate();
            foreach (var token in user.RefreshTokens.Where(t => t.IsActive))
                token.Revoke();
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<UserProfileDto>(user));
    }
}

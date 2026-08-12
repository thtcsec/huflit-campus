using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Commands;

public record UpdateUserRoleCommand(Guid UserId, UserRole Role) : IRequest<Result<UserProfileDto>>;

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, Result<UserProfileDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateUserRoleCommandHandler(
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
        UpdateUserRoleCommand request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInRole(UserRole.Administrator))
            throw new ForbiddenException("Only administrators can change user roles.");

        if (!Enum.IsDefined(request.Role))
            return Result.Failure<UserProfileDto>("Invalid role.");

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), request.UserId);

        if (user.Id == _currentUser.UserId.Value && request.Role != UserRole.Administrator)
            return Result.Failure<UserProfileDto>("You cannot remove your own administrator role.");

        if (user.Role == UserRole.Administrator && request.Role != UserRole.Administrator)
        {
            var adminCount = await _userRepository.CountAsync(
                u => !u.IsDeleted && u.IsActive && u.Role == UserRole.Administrator,
                cancellationToken);
            if (adminCount <= 1)
                return Result.Failure<UserProfileDto>("Cannot demote the last active administrator.");
        }

        user.AssignRole(request.Role);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<UserProfileDto>(user));
    }
}

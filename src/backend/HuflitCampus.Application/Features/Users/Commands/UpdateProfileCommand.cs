using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Commands;

public record UpdateProfileCommand(
    string FullName,
    string? Phone,
    string? Faculty,
    string? Major,
    string? AvatarUrl) : IRequest<Result<UserProfileDto>>;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<UserProfileDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateProfileCommandHandler(
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

    public async Task<Result<UserProfileDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (string.IsNullOrWhiteSpace(request.FullName))
            return Result.Failure<UserProfileDto>("Full name is required.");

        var user = await _userRepository.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), _currentUser.UserId.Value);

        user.UpdateProfile(
            request.FullName.Trim(),
            request.Phone?.Trim(),
            request.Faculty?.Trim(),
            request.Major?.Trim(),
            request.AvatarUrl);

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<UserProfileDto>(user));
    }
}

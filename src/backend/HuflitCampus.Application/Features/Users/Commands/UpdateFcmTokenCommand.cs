using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Commands;

public record UpdateFcmTokenCommand(string? FcmToken) : IRequest<Result>;

public class UpdateFcmTokenCommandHandler : IRequestHandler<UpdateFcmTokenCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFcmTokenCommandHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateFcmTokenCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var user = await _userRepository.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), _currentUser.UserId.Value);

        user.UpdateFcmToken(string.IsNullOrWhiteSpace(request.FcmToken) ? null : request.FcmToken.Trim());
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Auth.Commands;

public record LogoutCommand(string? RefreshToken = null) : IRequest<Result>;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LogoutCommandHandler(
        ICurrentUserService currentUser,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var user = await _userRepository.GetWithRefreshTokensAsync(_currentUser.UserId.Value, cancellationToken);
        if (user is null)
            return Result.Success();

        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            var hash = TokenHash.Compute(request.RefreshToken);
            var token = user.RefreshTokens.FirstOrDefault(t =>
                (t.Token == hash || t.Token == request.RefreshToken) && t.IsActive);
            token?.Revoke();
        }
        else
        {
            foreach (var token in user.RefreshTokens.Where(t => t.IsActive))
                token.Revoke();
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

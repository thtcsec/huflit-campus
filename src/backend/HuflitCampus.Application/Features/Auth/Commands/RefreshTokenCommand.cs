using AutoMapper;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Auth.Commands;

public record RefreshTokenCommand(RefreshTokenRequest Request) : IRequest<Result<AuthResponse>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;

    public RefreshTokenCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IJwtTokenService jwtTokenService,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var principal = _jwtTokenService.GetPrincipalFromExpiredToken(request.Request.AccessToken);
        if (principal is null)
            return Result.Failure<AuthResponse>("Invalid access token.");

        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? principal.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Result.Failure<AuthResponse>("Invalid token claims.");

        var user = await _userRepository.GetWithRefreshTokensAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
            return Result.Failure<AuthResponse>("User not found or inactive.");

        var presentedHash = TokenHash.Compute(request.Request.RefreshToken);
        var existing = user.RefreshTokens
            .FirstOrDefault(t => t.Token == presentedHash && !t.IsDeleted);

        // Backward-compatible lookup for tokens stored before hashing was introduced.
        existing ??= user.RefreshTokens
            .FirstOrDefault(t => t.Token == request.Request.RefreshToken && !t.IsDeleted);

        if (existing is null)
            return Result.Failure<AuthResponse>("Refresh token not found.");

        if (!existing.IsActive)
        {
            // Reuse of a revoked/expired refresh token → revoke the entire family.
            foreach (var token in user.RefreshTokens.Where(t => t.IsActive))
                token.Revoke();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Failure<AuthResponse>("Refresh token reuse detected. All sessions have been revoked.");
        }

        var tokens = _jwtTokenService.GenerateTokens(user);
        existing.Revoke(TokenHash.Compute(tokens.RefreshToken));
        _userRepository.AddRefreshToken(
            RefreshToken.Create(user.Id, tokens.RefreshToken, tokens.RefreshTokenExpiresAt));

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new AuthResponse
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            AccessTokenExpiresAt = tokens.AccessTokenExpiresAt,
            RefreshTokenExpiresAt = tokens.RefreshTokenExpiresAt,
            User = _mapper.Map<UserProfileDto>(user)
        });
    }
}

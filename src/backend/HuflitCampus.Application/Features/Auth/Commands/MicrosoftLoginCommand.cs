using AutoMapper;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Auth.Commands;

public record MicrosoftLoginCommand(MicrosoftLoginRequest Request) : IRequest<Result<AuthResponse>>;

public class MicrosoftLoginCommandHandler : IRequestHandler<MicrosoftLoginCommand, Result<AuthResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMicrosoftIdTokenValidator _idTokenValidator;
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public MicrosoftLoginCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IJwtTokenService jwtTokenService,
        IMicrosoftIdTokenValidator idTokenValidator,
        IMapper mapper,
        IDateTimeProvider dateTime)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _idTokenValidator = idTokenValidator;
        _mapper = mapper;
        _dateTime = dateTime;
    }

    public async Task<Result<AuthResponse>> Handle(MicrosoftLoginCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        var identityResult = await _idTokenValidator.ValidateAsync(
            req.IdToken,
            req.Email,
            req.FullName,
            req.ExternalId,
            req.AvatarUrl,
            cancellationToken);

        if (identityResult.IsFailure)
            return Result.Failure<AuthResponse>(identityResult.Error!);

        var identity = identityResult.Value!;
        var email = identity.Email;

        // AsNoTracking — avoid accidental User UPDATE concurrency with soft-delete filters.
        var user = await _userRepository.FindForLoginAsync(email, identity.ExternalId, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                Email = email,
                FullName = identity.FullName,
                AvatarUrl = identity.AvatarUrl,
                StudentId = req.StudentId,
                Faculty = req.Faculty,
                Major = req.Major,
                ExternalId = identity.ExternalId,
                AuthProvider = AuthProvider.MicrosoftEntra,
                // Privileged roles are assigned by admins / IdP groups — never inferred from email.
                Role = InferInitialRoleFromEmail(email),
                IsActive = true,
                CreatedAt = _dateTime.UtcNow
            };

            _userRepository.Add(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            if (!user.IsActive)
                return Result.Failure<AuthResponse>("Account is deactivated.");
        }

        var tokens = _jwtTokenService.GenerateTokens(user);
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

    private static UserRole InferInitialRoleFromEmail(string email)
    {
        if (email.EndsWith("@student.huflit.edu.vn", StringComparison.OrdinalIgnoreCase))
            return UserRole.Student;

        if (email.EndsWith("@huflit.edu.vn", StringComparison.OrdinalIgnoreCase))
            return UserRole.Student;

        return UserRole.Student;
    }
}

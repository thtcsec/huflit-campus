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
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public MicrosoftLoginCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IJwtTokenService jwtTokenService,
        IMapper mapper,
        IDateTimeProvider dateTime)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
        _dateTime = dateTime;
    }

    public async Task<Result<AuthResponse>> Handle(MicrosoftLoginCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        if (string.IsNullOrWhiteSpace(req.ExternalId) && string.IsNullOrWhiteSpace(req.Email))
            return Result.Failure<AuthResponse>("External ID or email is required.");

        var email = req.Email.Trim().ToLowerInvariant();

        var user = !string.IsNullOrWhiteSpace(req.ExternalId)
            ? await _userRepository.GetByExternalIdAsync(req.ExternalId, cancellationToken)
            : null;

        user ??= await _userRepository.GetByEmailAsync(email, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                Email = email,
                FullName = string.IsNullOrWhiteSpace(req.FullName) ? email : req.FullName.Trim(),
                AvatarUrl = req.AvatarUrl,
                StudentId = req.StudentId,
                Faculty = req.Faculty,
                Major = req.Major,
                ExternalId = req.ExternalId,
                AuthProvider = AuthProvider.MicrosoftEntra,
                Role = InferRoleFromEmail(email),
                IsActive = true,
                CreatedAt = _dateTime.UtcNow
            };

            _userRepository.Add(user);
        }
        else
        {
            if (!user.IsActive)
                return Result.Failure<AuthResponse>("Account is deactivated.");

            user.ExternalId ??= req.ExternalId;
            user.AuthProvider = AuthProvider.MicrosoftEntra;
            user.FullName = string.IsNullOrWhiteSpace(req.FullName) ? user.FullName : req.FullName.Trim();
            user.AvatarUrl = req.AvatarUrl ?? user.AvatarUrl;
            user.StudentId ??= req.StudentId;
            user.Faculty ??= req.Faculty;
            user.Major ??= req.Major;
            user.UpdatedAt = _dateTime.UtcNow;
            _userRepository.Update(user);
        }

        var tokens = _jwtTokenService.GenerateTokens(user);
        user.RefreshTokens.Add(RefreshToken.Create(user.Id, tokens.RefreshToken, tokens.RefreshTokenExpiresAt));

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

    private static UserRole InferRoleFromEmail(string email)
    {
        if (email.EndsWith("@huflit.edu.vn", StringComparison.OrdinalIgnoreCase))
            return UserRole.Lecturer;

        if (email.EndsWith("@student.huflit.edu.vn", StringComparison.OrdinalIgnoreCase))
            return UserRole.Student;

        return UserRole.Student;
    }
}

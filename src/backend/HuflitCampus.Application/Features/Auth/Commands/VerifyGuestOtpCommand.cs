using AutoMapper;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Auth.Commands;

public record VerifyGuestOtpCommand(GuestOtpVerifyRequest Request) : IRequest<Result<AuthResponse>>;

public class VerifyGuestOtpCommandHandler : IRequestHandler<VerifyGuestOtpCommand, Result<AuthResponse>>
{
    private readonly IOtpChallengeRepository _otpRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOtpService _otpService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public VerifyGuestOtpCommandHandler(
        IOtpChallengeRepository otpRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IOtpService otpService,
        IJwtTokenService jwtTokenService,
        IMapper mapper,
        IDateTimeProvider dateTime)
    {
        _otpRepository = otpRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _otpService = otpService;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
        _dateTime = dateTime;
    }

    public async Task<Result<AuthResponse>> Handle(VerifyGuestOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Request.Email.Trim().ToLowerInvariant();
        var challenge = await _otpRepository.GetLatestActiveAsync(email, cancellationToken);

        if (challenge is null)
            return Result.Failure<AuthResponse>("No active OTP found. Please request a new code.");

        var attemptResult = challenge.VerifyAttempt();
        if (attemptResult.IsFailure)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Failure<AuthResponse>(attemptResult.Error!);
        }

        if (!_otpService.VerifyCode(request.Request.Code.Trim(), challenge.CodeHash))
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Failure<AuthResponse>("Invalid verification code.");
        }

        challenge.Consume();

        var user = await _userRepository.FindForLoginAsync(email, externalId: null, cancellationToken);
        if (user is null)
        {
            var fullName = string.IsNullOrWhiteSpace(request.Request.FullName)
                ? email.Split('@')[0]
                : request.Request.FullName.Trim();

            user = new User
            {
                Email = email,
                FullName = fullName,
                AuthProvider = AuthProvider.EmailOtp,
                Role = UserRole.Guest,
                IsActive = true,
                CreatedAt = _dateTime.UtcNow
            };
            _userRepository.Add(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else if (!user.IsActive)
        {
            return Result.Failure<AuthResponse>("Account is deactivated.");
        }
        else if (user.Role != UserRole.Guest)
        {
            // Prevent privilege escalation: OTP must never mint tokens for staff/admin accounts.
            return Result.Failure<AuthResponse>(
                "This account requires Microsoft sign-in. Guest OTP cannot be used for staff accounts.");
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
}

using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Auth.Commands;

public record RequestGuestOtpCommand(GuestOtpRequest Request) : IRequest<Result>;

public class RequestGuestOtpCommandHandler : IRequestHandler<RequestGuestOtpCommand, Result>
{
    private readonly IOtpChallengeRepository _otpRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOtpService _otpService;
    private readonly IEmailSender _emailSender;

    public RequestGuestOtpCommandHandler(
        IOtpChallengeRepository otpRepository,
        IUnitOfWork unitOfWork,
        IOtpService otpService,
        IEmailSender emailSender)
    {
        _otpRepository = otpRepository;
        _unitOfWork = unitOfWork;
        _otpService = otpService;
        _emailSender = emailSender;
    }

    public async Task<Result> Handle(RequestGuestOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Request.Email.Trim().ToLowerInvariant();

        await _otpRepository.InvalidatePendingAsync(email, cancellationToken);

        var code = _otpService.GenerateCode();
        var challenge = OtpChallenge.Create(email, _otpService.HashCode(code), _otpService.DefaultLifetime);
        _otpRepository.Add(challenge);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailSender.SendAsync(
            email,
            "HUFLIT Campus – Your verification code",
            $"<p>Your one-time verification code is <strong>{code}</strong>.</p>" +
            $"<p>This code expires in {(int)_otpService.DefaultLifetime.TotalMinutes} minutes.</p>",
            cancellationToken);

        return Result.Success();
    }
}

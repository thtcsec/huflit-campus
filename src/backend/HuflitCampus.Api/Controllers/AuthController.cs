using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Application.Features.Auth.Commands;
using HuflitCampus.Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HuflitCampus.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController(ISender sender) : ApiControllerBase
{
    [HttpPost("microsoft-login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> MicrosoftLogin(
        [FromBody] MicrosoftLoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new MicrosoftLoginCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("guest/request-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("otp")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RequestGuestOtp(
        [FromBody] GuestOtpRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RequestGuestOtpCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("guest/verify-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("otp")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyGuestOtp(
        [FromBody] GuestOtpVerifyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new VerifyGuestOtpCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RefreshTokenCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest? request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new LogoutCommand(request?.RefreshToken), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCurrentUserQuery(), cancellationToken);
        return FromResult(result);
    }
}

public sealed class LogoutRequest
{
    public string? RefreshToken { get; set; }
}

using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Application.Features.Users.Commands;
using HuflitCampus.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/users")]
public sealed class UsersController(ISender sender) : ApiControllerBase
{
    [HttpGet("{id:guid}/profile")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfile(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetUserProfileQuery(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPut("me/profile")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateProfileCommand(
                request.FullName,
                request.Phone,
                request.Faculty,
                request.Major,
                request.AvatarUrl),
            cancellationToken);

        return FromResult(result);
    }

    [HttpPut("me/fcm-token")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateFcmToken(
        [FromBody] UpdateFcmTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateFcmTokenCommand(request.FcmToken), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("me/attendance")]
    [ProducesResponseType(typeof(IReadOnlyList<AttendanceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyAttendanceHistory(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetUserAttendanceHistoryQuery(), cancellationToken);
        return FromResult(result);
    }
}

public sealed class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Faculty { get; set; }
    public string? Major { get; set; }
    public string? AvatarUrl { get; set; }
}

public sealed class UpdateFcmTokenRequest
{
    public string? FcmToken { get; set; }
}

using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Application.Features.Attendance.Commands;
using HuflitCampus.Application.Features.Attendance.Queries;
using HuflitCampus.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/attendance")]
public sealed class AttendanceController(ISender sender) : ApiControllerBase
{
    [HttpPost("events/{eventId:guid}/qr")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(QrPayloadDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateQr(
        Guid eventId,
        [FromBody] GenerateQrBody? body,
        CancellationToken cancellationToken)
    {
        var request = new GenerateQrRequest
        {
            EventId = eventId,
            ValiditySeconds = body?.ValiditySeconds ?? 30,
            IsSingleUse = body?.IsSingleUse ?? true
        };

        var result = await sender.Send(new GenerateDynamicQrCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("check-in")]
    [ProducesResponseType(typeof(AttendanceDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CheckInCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("check-out")]
    [ProducesResponseType(typeof(AttendanceDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CheckOutCommand(request), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("events/{eventId:guid}")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(IReadOnlyList<AttendanceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEventAttendance(Guid eventId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetEventAttendanceQuery(eventId), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(IReadOnlyList<AttendanceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetMyAttendanceQuery(), cancellationToken);
        return FromResult(result);
    }
}

public sealed class GenerateQrBody
{
    public int ValiditySeconds { get; set; } = 30;
    public bool IsSingleUse { get; set; } = true;
}

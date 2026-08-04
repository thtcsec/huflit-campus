using HuflitCampus.Application.DTOs.Registrations;
using HuflitCampus.Application.Features.Registrations.Commands;
using HuflitCampus.Application.Features.Registrations.Queries;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Constants;
using HuflitCampus.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/registrations")]
public sealed class RegistrationsController(ISender sender) : ApiControllerBase
{
    [HttpPost("events/{eventId:guid}")]
    [ProducesResponseType(typeof(RegistrationDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(
        Guid eventId,
        [FromBody] RegisterEventRequest? request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new RegisterForEventCommand(eventId, request ?? new RegisterEventRequest()),
            cancellationToken);

        if (result.IsFailure)
            return FromResult(result);

        return StatusCode(StatusCodes.Status201Created, result.Value);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(RegistrationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CancelRegistrationCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(RegistrationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveRegistrationCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(RegistrationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(
        Guid id,
        [FromBody] RejectRegistrationBody? body,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectRegistrationCommand(id, body?.Notes), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(PagedResult<RegistrationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] RegistrationStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetMyRegistrationsQuery(page, pageSize, status), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("events/{eventId:guid}")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(PagedResult<RegistrationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByEvent(
        Guid eventId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] RegistrationStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetEventRegistrationsQuery(eventId, page, pageSize, status),
            cancellationToken);

        return FromResult(result);
    }
}

public sealed class RejectRegistrationBody
{
    public string? Notes { get; set; }
}

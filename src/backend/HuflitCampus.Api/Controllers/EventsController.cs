using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Application.Features.Events.Commands;
using HuflitCampus.Application.Features.Events.Queries;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Route("api/events")]
public sealed class EventsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<EventListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] EventSearchRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SearchEventsQuery(request), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("home")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(HomeFeedDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Home([FromQuery] int take = 8, CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetHomeFeedQuery(take), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetEventByIdQuery(id), cancellationToken);
        return FromResult(result);
    }

    [HttpGet("{id:guid}/related")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<EventListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRelated(Guid id, [FromQuery] int take = 6, CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetRelatedEventsQuery(id, take), cancellationToken);
        return FromResult(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateEventRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateEventCommand(request), cancellationToken);
        if (result.IsFailure)
            return FromResult(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UpdateEventCommand(id, request), cancellationToken);
        return FromResult(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteEventCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/submit")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SubmitEventCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = Policies.CanApproveEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Approve(
        Guid id,
        [FromBody] ApproveEventRequest? request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ApproveEventCommand(id, request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = Policies.CanApproveEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Reject(
        Guid id,
        [FromBody] RejectEventRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RejectEventCommand(id, request), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/publish")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Publish(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new PublishEventCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel(
        Guid id,
        [FromBody] CancelEventBody? body,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CancelEventCommand(id, body?.Reason), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/close-registration")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CloseRegistration(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CloseRegistrationCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("{id:guid}/complete")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(EventDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CompleteEventCommand(id), cancellationToken);
        return FromResult(result);
    }
}

public sealed class CancelEventBody
{
    public string? Reason { get; set; }
}

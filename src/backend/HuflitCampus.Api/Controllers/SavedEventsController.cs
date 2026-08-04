using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Application.Features.SavedEvents.Commands;
using HuflitCampus.Application.Features.SavedEvents.Queries;
using HuflitCampus.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/saved-events")]
public sealed class SavedEventsController(ISender sender) : ApiControllerBase
{
    [HttpPost("{eventId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Save(Guid eventId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SaveEventCommand(eventId), cancellationToken);
        return FromResult(result);
    }

    [HttpDelete("{eventId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Unsave(Guid eventId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new UnsaveEventCommand(eventId), cancellationToken);
        return FromResult(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<EventListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetSavedEventsQuery(page, pageSize), cancellationToken);
        return FromResult(result);
    }
}

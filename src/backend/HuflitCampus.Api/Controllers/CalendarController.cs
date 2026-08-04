using HuflitCampus.Application.DTOs.Calendar;
using HuflitCampus.Application.Features.Events.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/calendar")]
public sealed class CalendarController(ISender sender) : ApiControllerBase
{
    [HttpGet("events")]
    [ProducesResponseType(typeof(IReadOnlyList<CalendarEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEvents(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetCalendarEventsQuery(from, to), cancellationToken);
        return FromResult(result);
    }
}

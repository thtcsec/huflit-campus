using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Application.Features.Announcements.Queries;
using HuflitCampus.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Route("api/announcements")]
public sealed class AnnouncementsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<AnnouncementDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActive(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetActiveAnnouncementsQuery(page, pageSize), cancellationToken);
        return FromResult(result);
    }
}

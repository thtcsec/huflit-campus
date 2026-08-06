using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Application.Features.Announcements.Commands;
using HuflitCampus.Application.Features.Announcements.Queries;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Constants;
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

    [HttpPost]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(AnnouncementDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateAnnouncementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateAnnouncementCommand(
                request.Title,
                request.Body,
                request.IsPinned,
                request.PublishedAt,
                request.ExpiresAt),
            cancellationToken);

        if (result.IsFailure)
            return FromResult(result);

        return CreatedAtAction(nameof(GetActive), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(typeof(AnnouncementDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] CreateAnnouncementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new UpdateAnnouncementCommand(
                id,
                request.Title,
                request.Body,
                request.IsPinned,
                request.PublishedAt,
                request.ExpiresAt),
            cancellationToken);

        return FromResult(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.CanManageEvents)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteAnnouncementCommand(id), cancellationToken);
        return FromResult(result);
    }
}

public sealed class CreateAnnouncementRequest
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}


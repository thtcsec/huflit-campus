using HuflitCampus.Application.DTOs.Notifications;
using HuflitCampus.Application.Features.Notifications.Commands;
using HuflitCampus.Application.Features.Notifications.Queries;
using HuflitCampus.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController(ISender sender) : ApiControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool unreadOnly = false,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetMyNotificationsQuery(page, pageSize, unreadOnly),
            cancellationToken);

        return FromResult(result);
    }

    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new MarkNotificationReadCommand(id), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new MarkAllNotificationsReadCommand(), cancellationToken);
        return FromResult(result);
    }
}

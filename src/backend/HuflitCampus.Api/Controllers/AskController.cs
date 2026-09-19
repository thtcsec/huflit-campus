using HuflitCampus.Application.DTOs.Ask;
using HuflitCampus.Application.Features.Ask.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HuflitCampus.Api.Controllers;

[Route("api/ask")]
[Authorize]
public sealed class AskController(ISender sender) : ApiControllerBase
{
    [HttpGet("health")]
    [ProducesResponseType(typeof(AskHealthDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Health(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAskHealthQuery(), cancellationToken);
        return FromResult(result);
    }

    [HttpPost("query")]
    [EnableRateLimiting("ask")]
    [ProducesResponseType(typeof(AskQueryResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Query(
        [FromBody] AskQueryHttpRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new AskCampusQuery(request.Query, request.SessionId),
            cancellationToken);
        return FromResult(result);
    }
}

public sealed class AskQueryHttpRequest
{
    public string Query { get; set; } = string.Empty;
    public string? SessionId { get; set; }
}

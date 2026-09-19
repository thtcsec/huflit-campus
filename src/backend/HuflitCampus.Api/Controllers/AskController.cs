using HuflitCampus.Application.DTOs.Ask;
using HuflitCampus.Application.Features.Ask.Queries;
using HuflitCampus.Domain.Constants;
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

    /// <summary>Defaults + whether the current user may override provider/model (Administrator).</summary>
    [HttpGet("llm/settings")]
    [ProducesResponseType(typeof(AskLlmSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> LlmSettings(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAskLlmSettingsQuery(), cancellationToken);
        return FromResult(result);
    }

    /// <summary>Proxies EnterpriseRAG LLM catalog. Administrator only (for test routing).</summary>
    [HttpGet("llm/catalog")]
    [Authorize(Policy = Policies.CanManageUsers)]
    [ProducesResponseType(typeof(AskLlmCatalogDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> LlmCatalog(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAskLlmCatalogQuery(), cancellationToken);
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
            new AskCampusQuery(
                request.Query,
                request.SessionId,
                request.Provider,
                request.Model,
                request.Failover),
            cancellationToken);
        return FromResult(result);
    }
}

public sealed class AskQueryHttpRequest
{
    public string Query { get; set; } = string.Empty;
    public string? SessionId { get; set; }
    public string? Provider { get; set; }
    public string? Model { get; set; }
    public bool? Failover { get; set; }
}

using HuflitCampus.Application.DTOs.Dashboard;
using HuflitCampus.Application.Features.Dashboard.Queries;
using HuflitCampus.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[Authorize(Policy = Policies.CanViewAnalytics)]
[Route("api/dashboard")]
public sealed class DashboardController(ISender sender) : ApiControllerBase
{
    [HttpGet("admin")]
    [ProducesResponseType(typeof(AdminDashboardDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAdmin(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetAdminDashboardQuery(), cancellationToken);
        return FromResult(result);
    }
}

using HuflitCampus.Domain.Common;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromResult(Result result)
    {
        if (result.IsSuccess)
            return NoContent();

        return Problem(
            detail: result.Error,
            statusCode: StatusCodes.Status400BadRequest,
            title: "Request failed");
    }

    protected IActionResult FromResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        return Problem(
            detail: result.Error,
            statusCode: StatusCodes.Status400BadRequest,
            title: "Request failed");
    }

    protected IActionResult FromResultCreated<T>(Result<T> result, string actionName, object? routeValues = null)
    {
        if (result.IsSuccess)
            return CreatedAtAction(actionName, routeValues, result.Value);

        return Problem(
            detail: result.Error,
            statusCode: StatusCodes.Status400BadRequest,
            title: "Request failed");
    }

    protected IActionResult FromResultOkOrNoContent(Result result)
    {
        if (result.IsSuccess)
            return NoContent();

        return Problem(
            detail: result.Error,
            statusCode: StatusCodes.Status400BadRequest,
            title: "Request failed");
    }
}

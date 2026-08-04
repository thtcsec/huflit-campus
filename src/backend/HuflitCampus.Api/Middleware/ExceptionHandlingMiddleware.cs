using System.Text.Json;
using FluentValidation;
using HuflitCampus.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace HuflitCampus.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, detail, errors) = MapException(exception);

        if (statusCode >= StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            _logger.LogWarning(exception, "Handled exception for {Method} {Path}: {Message}", context.Request.Method, context.Request.Path, exception.Message);

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
            Type = $"https://httpstatuses.com/{statusCode}"
        };

        if (errors is not null)
            problem.Extensions["errors"] = errors;

        if (_environment.IsDevelopment() && statusCode >= StatusCodes.Status500InternalServerError)
            problem.Extensions["exception"] = exception.ToString();

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, JsonOptions));
    }

    private static (int StatusCode, string Title, string Detail, object? Errors) MapException(Exception exception)
    {
        return exception switch
        {
            NotFoundException ex => (
                StatusCodes.Status404NotFound,
                "Not Found",
                ex.Message,
                null),

            ForbiddenException ex => (
                StatusCodes.Status403Forbidden,
                "Forbidden",
                ex.Message,
                null),

            ConflictException ex => (
                StatusCodes.Status409Conflict,
                "Conflict",
                ex.Message,
                null),

            UnauthorizedAppException ex => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                ex.Message,
                null),

            ValidationException ex => (
                StatusCodes.Status400BadRequest,
                "Validation Failed",
                "One or more validation errors occurred.",
                ex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray())),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "An unexpected error occurred.",
                null)
        };
    }
}

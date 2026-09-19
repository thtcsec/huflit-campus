using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Ask;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using MediatR;

namespace HuflitCampus.Application.Features.Ask.Queries;

public record AskCampusQuery(
    string Query,
    string? SessionId,
    string? Provider = null,
    string? Model = null,
    bool? Failover = null) : IRequest<Result<AskQueryResponseDto>>;

public sealed class AskCampusQueryHandler(
    IAskRagClient askRagClient,
    ICurrentUserService currentUser,
    IAskRoutingSettings routingSettings)
    : IRequestHandler<AskCampusQuery, Result<AskQueryResponseDto>>
{
    private const int MaxQueryLength = 2000;

    public async Task<Result<AskQueryResponseDto>> Handle(
        AskCampusQuery request,
        CancellationToken cancellationToken)
    {
        var query = (request.Query ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(query))
            return Result.Failure<AskQueryResponseDto>("Query is required.");

        if (query.Length > MaxQueryLength)
            return Result.Failure<AskQueryResponseDto>($"Query must be at most {MaxQueryLength} characters.");

        var isAdmin = currentUser.Role == UserRole.Administrator;

        var provider = isAdmin && !string.IsNullOrWhiteSpace(request.Provider)
            ? request.Provider!.Trim()
            : (string.IsNullOrWhiteSpace(routingSettings.DefaultProvider) ? "auto" : routingSettings.DefaultProvider.Trim());

        var model = isAdmin && !string.IsNullOrWhiteSpace(request.Model)
            ? request.Model!.Trim()
            : (string.IsNullOrWhiteSpace(routingSettings.DefaultModel) ? "auto" : routingSettings.DefaultModel.Trim());

        var failover = isAdmin && request.Failover.HasValue
            ? request.Failover.Value
            : routingSettings.Failover;

        var routing = new AskQueryRouting
        {
            Provider = provider,
            Model = model,
            Failover = failover,
            AutoRoute = string.Equals(provider, "auto", StringComparison.OrdinalIgnoreCase)
        };

        var aclScope = MapAclScope(currentUser.Role);
        return await askRagClient.QueryAsync(query, request.SessionId, aclScope, routing, cancellationToken);
    }

    internal static string MapAclScope(UserRole? role) => role switch
    {
        UserRole.Administrator or UserRole.FacultyManager => "public,student,staff",
        UserRole.Lecturer or UserRole.ClubManager => "public,student,staff",
        UserRole.Student => "public,student",
        _ => "public"
    };
}

public record GetAskHealthQuery : IRequest<Result<AskHealthDto>>;

public sealed class GetAskHealthQueryHandler(IAskRagClient askRagClient)
    : IRequestHandler<GetAskHealthQuery, Result<AskHealthDto>>
{
    public Task<Result<AskHealthDto>> Handle(GetAskHealthQuery request, CancellationToken cancellationToken)
        => askRagClient.GetHealthAsync(cancellationToken);
}

public record GetAskLlmSettingsQuery : IRequest<Result<AskLlmSettingsDto>>;

public sealed class GetAskLlmSettingsQueryHandler(
    ICurrentUserService currentUser,
    IAskRoutingSettings routingSettings)
    : IRequestHandler<GetAskLlmSettingsQuery, Result<AskLlmSettingsDto>>
{
    public Task<Result<AskLlmSettingsDto>> Handle(
        GetAskLlmSettingsQuery request,
        CancellationToken cancellationToken)
    {
        var canConfigure = currentUser.Role == UserRole.Administrator;
        return Task.FromResult(Result.Success(new AskLlmSettingsDto
        {
            CanConfigure = canConfigure,
            DefaultProvider = string.IsNullOrWhiteSpace(routingSettings.DefaultProvider)
                ? "auto"
                : routingSettings.DefaultProvider,
            DefaultModel = string.IsNullOrWhiteSpace(routingSettings.DefaultModel)
                ? "auto"
                : routingSettings.DefaultModel,
            DefaultFailover = routingSettings.Failover,
            Hint = canConfigure
                ? "Administrator: chọn provider/model để kiểm thử. LLM API keys nằm trên EnterpriseRAG (.env), không trên campus."
                : "Sinh viên dùng Smart Router (auto). Chỉ Administrator mới đổi model khi kiểm thử."
        }));
    }
}

public record GetAskLlmCatalogQuery : IRequest<Result<AskLlmCatalogDto>>;

public sealed class GetAskLlmCatalogQueryHandler(
    IAskRagClient askRagClient,
    ICurrentUserService currentUser)
    : IRequestHandler<GetAskLlmCatalogQuery, Result<AskLlmCatalogDto>>
{
    public async Task<Result<AskLlmCatalogDto>> Handle(
        GetAskLlmCatalogQuery request,
        CancellationToken cancellationToken)
    {
        if (currentUser.Role != UserRole.Administrator)
            return Result.Failure<AskLlmCatalogDto>("Only Administrators can view the LLM catalog.");

        return await askRagClient.GetLlmCatalogAsync(cancellationToken);
    }
}

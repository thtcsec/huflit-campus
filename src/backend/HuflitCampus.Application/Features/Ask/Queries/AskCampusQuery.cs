using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Ask;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Enums;
using MediatR;

namespace HuflitCampus.Application.Features.Ask.Queries;

public record AskCampusQuery(string Query, string? SessionId)
    : IRequest<Result<AskQueryResponseDto>>;

public sealed class AskCampusQueryHandler(
    IAskRagClient askRagClient,
    ICurrentUserService currentUser)
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

        var aclScope = MapAclScope(currentUser.Role);
        return await askRagClient.QueryAsync(query, request.SessionId, aclScope, cancellationToken);
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

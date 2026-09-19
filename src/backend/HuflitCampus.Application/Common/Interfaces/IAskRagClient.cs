using HuflitCampus.Application.DTOs.Ask;
using HuflitCampus.Domain.Common;

namespace HuflitCampus.Application.Common.Interfaces;

public interface IAskRagClient
{
    Task<Result<AskHealthDto>> GetHealthAsync(CancellationToken cancellationToken = default);

    Task<Result<AskLlmCatalogDto>> GetLlmCatalogAsync(CancellationToken cancellationToken = default);

    Task<Result<AskQueryResponseDto>> QueryAsync(
        string query,
        string? sessionId,
        string aclScope,
        AskQueryRouting routing,
        CancellationToken cancellationToken = default);
}

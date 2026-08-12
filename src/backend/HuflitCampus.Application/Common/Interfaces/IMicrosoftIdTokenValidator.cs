using HuflitCampus.Domain.Common;

namespace HuflitCampus.Application.Common.Interfaces;

public sealed record ValidatedMicrosoftIdentity(
    string ExternalId,
    string Email,
    string FullName,
    string? AvatarUrl);

public interface IMicrosoftIdTokenValidator
{
    Task<Result<ValidatedMicrosoftIdentity>> ValidateAsync(
        string idToken,
        string? fallbackEmail,
        string? fallbackFullName,
        string? fallbackExternalId,
        string? fallbackAvatarUrl,
        CancellationToken cancellationToken = default);
}

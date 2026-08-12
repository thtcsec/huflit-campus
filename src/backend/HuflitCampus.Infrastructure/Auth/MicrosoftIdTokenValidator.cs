using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Infrastructure.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace HuflitCampus.Infrastructure.Auth;

public sealed class MicrosoftIdTokenValidator : IMicrosoftIdTokenValidator
{
    private readonly EntraIdOptions _entra;
    private readonly AuthOptions _auth;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<MicrosoftIdTokenValidator> _logger;
    private readonly ConfigurationManager<OpenIdConnectConfiguration>? _configurationManager;

    public MicrosoftIdTokenValidator(
        IOptions<EntraIdOptions> entra,
        IOptions<AuthOptions> auth,
        IWebHostEnvironment environment,
        ILogger<MicrosoftIdTokenValidator> logger)
    {
        _entra = entra.Value;
        _auth = auth.Value;
        _environment = environment;
        _logger = logger;

        if (_entra.IsConfigured)
        {
            var metadataAddress =
                $"{_entra.Instance.TrimEnd('/')}/{_entra.TenantId}/v2.0/.well-known/openid-configuration";

            _configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                metadataAddress,
                new OpenIdConnectConfigurationRetriever(),
                new HttpDocumentRetriever());
        }
    }

    public async Task<Result<ValidatedMicrosoftIdentity>> ValidateAsync(
        string idToken,
        string? fallbackEmail,
        string? fallbackFullName,
        string? fallbackExternalId,
        string? fallbackAvatarUrl,
        CancellationToken cancellationToken = default)
    {
        if (_entra.IsConfigured)
            return await ValidateEntraIdTokenAsync(idToken, cancellationToken);

        if (_auth.AllowDevMicrosoftBypass && _environment.IsDevelopment())
        {
            _logger.LogWarning(
                "Auth:AllowDevMicrosoftBypass is enabled — trusting client-supplied Microsoft identity (Development only).");

            if (string.IsNullOrWhiteSpace(fallbackEmail) && string.IsNullOrWhiteSpace(fallbackExternalId))
                return Result.Failure<ValidatedMicrosoftIdentity>("External ID or email is required.");

            var email = (fallbackEmail ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email))
                return Result.Failure<ValidatedMicrosoftIdentity>("Email is required for development Microsoft bypass.");

            return Result.Success(new ValidatedMicrosoftIdentity(
                ExternalId: string.IsNullOrWhiteSpace(fallbackExternalId)
                    ? $"dev:{email}"
                    : fallbackExternalId.Trim(),
                Email: email,
                FullName: string.IsNullOrWhiteSpace(fallbackFullName) ? email : fallbackFullName.Trim(),
                AvatarUrl: fallbackAvatarUrl));
        }

        return Result.Failure<ValidatedMicrosoftIdentity>(
            "Microsoft Entra ID login is not configured. Set AzureAd:Enabled=true with TenantId and ClientId.");
    }

    private async Task<Result<ValidatedMicrosoftIdentity>> ValidateEntraIdTokenAsync(
        string idToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(idToken) || idToken.Equals("dev-mock-id-token", StringComparison.Ordinal))
            return Result.Failure<ValidatedMicrosoftIdentity>("A valid Microsoft ID token is required.");

        if (_configurationManager is null)
            return Result.Failure<ValidatedMicrosoftIdentity>("Entra ID metadata is not configured.");

        try
        {
            var oidcConfig = await _configurationManager.GetConfigurationAsync(cancellationToken);
            var audience = string.IsNullOrWhiteSpace(_entra.Audience) ? _entra.ClientId : _entra.Audience;

            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers =
                [
                    $"{_entra.Instance.TrimEnd('/')}/{_entra.TenantId}/v2.0",
                    $"https://login.microsoftonline.com/{_entra.TenantId}/v2.0",
                    $"https://sts.windows.net/{_entra.TenantId}/"
                ],
                ValidateAudience = true,
                ValidAudiences = [audience, _entra.ClientId],
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = oidcConfig.SigningKeys,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(2),
                NameClaimType = "preferred_username"
            };

            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(idToken, parameters, out _);

            var oid = principal.FindFirstValue("oid")
                      ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = principal.FindFirstValue("preferred_username")
                        ?? principal.FindFirstValue("email")
                        ?? principal.FindFirstValue("upn")
                        ?? principal.FindFirstValue(ClaimTypes.Email);
            var name = principal.FindFirstValue("name")
                       ?? principal.FindFirstValue(ClaimTypes.Name)
                       ?? email;
            var avatar = principal.FindFirstValue("picture");

            if (string.IsNullOrWhiteSpace(oid))
                return Result.Failure<ValidatedMicrosoftIdentity>("ID token is missing the oid claim.");

            if (string.IsNullOrWhiteSpace(email))
                return Result.Failure<ValidatedMicrosoftIdentity>("ID token is missing an email claim.");

            return Result.Success(new ValidatedMicrosoftIdentity(
                ExternalId: oid,
                Email: email.Trim().ToLowerInvariant(),
                FullName: string.IsNullOrWhiteSpace(name) ? email : name.Trim(),
                AvatarUrl: avatar));
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Microsoft ID token validation failed.");
            return Result.Failure<ValidatedMicrosoftIdentity>("Invalid Microsoft ID token.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error validating Microsoft ID token.");
            return Result.Failure<ValidatedMicrosoftIdentity>("Unable to validate Microsoft ID token.");
        }
    }
}

using System.IdentityModel.Tokens.Jwt;
using System.Text;
using HuflitCampus.Infrastructure.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;

namespace HuflitCampus.Infrastructure.Auth;

public static class AuthenticationExtensions
{
    public const string LocalScheme = "LocalJwt";
    public const string EntraScheme = "Entra";
    public const string SmartScheme = "Smart";

    public static IServiceCollection AddHuflitAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
                          ?? new JwtSettings();
        var entraOptions = configuration.GetSection(EntraIdOptions.SectionName).Get<EntraIdOptions>()
                           ?? new EntraIdOptions();

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<EntraIdOptions>(configuration.GetSection(EntraIdOptions.SectionName));

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = SmartScheme;
            options.DefaultChallengeScheme = SmartScheme;
        });

        authBuilder.AddJwtBearer(LocalScheme, options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        string.IsNullOrWhiteSpace(jwtSettings.SecretKey)
                            ? new string('x', 32)
                            : jwtSettings.SecretKey)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                NameClaimType = JwtRegisteredClaimNames.Sub,
                RoleClaimType = System.Security.Claims.ClaimTypes.Role
            };
        });

        if (entraOptions.IsConfigured)
        {
            authBuilder.AddMicrosoftIdentityWebApi(
                configuration.GetSection(EntraIdOptions.SectionName),
                jwtBearerScheme: EntraScheme);
        }

        authBuilder.AddPolicyScheme(SmartScheme, SmartScheme, options =>
        {
            options.ForwardDefaultSelector = context =>
            {
                var authHeader = context.Request.Headers.Authorization.ToString();
                if (string.IsNullOrWhiteSpace(authHeader)
                    || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    return LocalScheme;
                }

                var token = authHeader["Bearer ".Length..].Trim();
                if (string.IsNullOrWhiteSpace(token))
                    return LocalScheme;

                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    if (!handler.CanReadToken(token))
                        return LocalScheme;

                    var jwt = handler.ReadJwtToken(token);
                    var issuer = jwt.Issuer ?? string.Empty;

                    if (entraOptions.IsConfigured
                        && (issuer.Contains("login.microsoftonline.com", StringComparison.OrdinalIgnoreCase)
                            || issuer.Contains("sts.windows.net", StringComparison.OrdinalIgnoreCase)
                            || (!string.IsNullOrWhiteSpace(entraOptions.TenantId)
                                && issuer.Contains(entraOptions.TenantId, StringComparison.OrdinalIgnoreCase))))
                    {
                        return EntraScheme;
                    }

                    return LocalScheme;
                }
                catch
                {
                    return LocalScheme;
                }
            };
        });

        return services;
    }
}

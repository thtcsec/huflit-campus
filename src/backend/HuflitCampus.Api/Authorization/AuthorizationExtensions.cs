using HuflitCampus.Domain.Constants;
using HuflitCampus.Infrastructure.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;

namespace HuflitCampus.Api.Authorization;

public static class AuthorizationExtensions
{
    /// <summary>
    /// Registers authorization policies and SignalR JWT support.
    /// JWT/Entra authentication is registered by <c>AddInfrastructure</c> via <c>AddHuflitAuthentication</c>.
    /// </summary>
    public static IServiceCollection AddHuflitCampusAuth(this IServiceCollection services)
    {
        services.AddHuflitCampusAuthorizationPolicies();
        services.ConfigureSignalRJwtBearer();
        return services;
    }

    public static IServiceCollection AddHuflitCampusAuthorizationPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(Policies.CanManageEvents, policy =>
                policy.RequireRole(
                    Roles.Lecturer,
                    Roles.ClubManager,
                    Roles.FacultyManager,
                    Roles.Administrator));

            options.AddPolicy(Policies.CanApproveEvents, policy =>
                policy.RequireRole(Roles.FacultyManager, Roles.Administrator));

            options.AddPolicy(Policies.CanViewAnalytics, policy =>
                policy.RequireRole(Roles.FacultyManager, Roles.Administrator));

            options.AddPolicy(Policies.CanManageUsers, policy =>
                policy.RequireRole(Roles.Administrator));
        });

        return services;
    }

    public static IServiceCollection ConfigureSignalRJwtBearer(this IServiceCollection services)
    {
        services.PostConfigure<JwtBearerOptions>(AuthenticationExtensions.LocalScheme, options =>
        {
            var existing = options.Events ?? new JwtBearerEvents();
            var previous = existing.OnMessageReceived;

            options.Events = existing;
            options.Events.OnMessageReceived = async context =>
            {
                if (previous is not null)
                    await previous(context);

                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    context.Token = accessToken;
            };
        });

        return services;
    }

    public static IServiceCollection AddHuflitCampusSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "HUFLIT Campus API",
                Version = "v1",
                Description = "Event Management System API for HUFLIT Campus"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT Bearer token"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}

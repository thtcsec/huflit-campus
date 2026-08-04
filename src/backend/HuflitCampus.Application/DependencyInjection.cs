using System.Text;
using System.Text.RegularExpressions;
using AutoMapper;
using FluentValidation;
using HuflitCampus.Application.Common.Behaviors;
using HuflitCampus.Application.Mappings;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace HuflitCampus.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        services.AddValidatorsFromAssembly(assembly);

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

        return services;
    }

    public static string ToSlug(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Guid.NewGuid().ToString("N")[..8];

        var normalized = title.Trim().ToLowerInvariant();
        normalized = RemoveDiacritics(normalized);
        normalized = Regex.Replace(normalized, @"[^a-z0-9\s-]", string.Empty);
        normalized = Regex.Replace(normalized, @"\s+", "-");
        normalized = Regex.Replace(normalized, @"-+", "-").Trim('-');

        return string.IsNullOrWhiteSpace(normalized)
            ? Guid.NewGuid().ToString("N")[..8]
            : normalized;
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);

        foreach (var c in normalized)
        {
            var uc = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (uc != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}

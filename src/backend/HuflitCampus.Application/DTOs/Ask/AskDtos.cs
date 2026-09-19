namespace HuflitCampus.Application.DTOs.Ask;

public sealed class AskQueryRequestDto
{
    public string Query { get; set; } = string.Empty;
    public string? SessionId { get; set; }
    /// <summary>Admin-only override. Ignored for non-admins.</summary>
    public string? Provider { get; set; }
    /// <summary>Admin-only override. Ignored for non-admins.</summary>
    public string? Model { get; set; }
    /// <summary>Admin-only override. Null = use server default.</summary>
    public bool? Failover { get; set; }
}

public sealed class AskSourceDto
{
    public string Source { get; set; } = string.Empty;
    public double Score { get; set; }
    public string Text { get; set; } = string.Empty;
}

public sealed class AskQueryResponseDto
{
    public string Query { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public bool Cached { get; set; }
    public string? CacheType { get; set; }
    public string? SessionId { get; set; }
    public IReadOnlyList<AskSourceDto> Sources { get; set; } = [];
    public bool Abstained { get; set; }
    public string? Message { get; set; }
    public string? Provider { get; set; }
    public string? Model { get; set; }
}

public sealed class AskHealthDto
{
    public bool Enabled { get; set; }
    public bool RagReachable { get; set; }
    public string Message { get; set; } = string.Empty;
}

public sealed class AskLlmSettingsDto
{
    public bool CanConfigure { get; set; }
    public string DefaultProvider { get; set; } = "auto";
    public string DefaultModel { get; set; } = "auto";
    public bool DefaultFailover { get; set; } = true;
    public string Hint { get; set; } = string.Empty;
}

public sealed class AskLlmModelDto
{
    public string ModelId { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public bool Enabled { get; set; } = true;
    public bool IsDefault { get; set; }
}

public sealed class AskLlmProviderDto
{
    public string Slug { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public bool Configured { get; set; } = true;
    public IReadOnlyList<AskLlmModelDto> Models { get; set; } = [];
}

public sealed class AskLlmCatalogDto
{
    public string Source { get; set; } = "unknown";
    public string? FetchedAt { get; set; }
    public IReadOnlyList<AskLlmProviderDto> Providers { get; set; } = [];
}

public sealed class AskQueryRouting
{
    public string Provider { get; init; } = "auto";
    public string Model { get; init; } = "auto";
    public bool Failover { get; init; } = true;
    public bool AutoRoute { get; init; } = true;
}

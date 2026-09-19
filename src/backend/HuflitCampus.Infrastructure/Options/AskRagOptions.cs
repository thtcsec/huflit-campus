namespace HuflitCampus.Infrastructure.Options;

public class AskRagOptions
{
    public const string SectionName = "AskRag";

    public bool Enabled { get; set; } = true;
    public string BaseUrl { get; set; } = "http://localhost:8000";
    public string? ApiKey { get; set; }
    public int TimeoutSeconds { get; set; } = 60;

    /// <summary>Default LLM provider for Ask (students always use this; admins may override).</summary>
    public string DefaultProvider { get; set; } = "auto";

    /// <summary>Default model id (use "auto" with Smart Router).</summary>
    public string DefaultModel { get; set; } = "auto";

    /// <summary>Provider failover chain on EnterpriseRAG.</summary>
    public bool Failover { get; set; } = true;
}

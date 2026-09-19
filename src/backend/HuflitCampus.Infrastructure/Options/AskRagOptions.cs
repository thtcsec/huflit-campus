namespace HuflitCampus.Infrastructure.Options;

public class AskRagOptions
{
    public const string SectionName = "AskRag";

    public bool Enabled { get; set; } = true;
    public string BaseUrl { get; set; } = "http://localhost:8000";
    public string? ApiKey { get; set; }
    public int TimeoutSeconds { get; set; } = 60;
}

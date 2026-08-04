namespace HuflitCampus.Infrastructure.Options;

public class BlobStorageOptions
{
    public const string SectionName = "AzureBlob";

    public string? ConnectionString { get; set; }
    public string ContainerName { get; set; } = "huflit-campus";
    public string? PublicBaseUrl { get; set; }

    /// <summary>Local fallback root path when Azure is not configured (Development).</summary>
    public string LocalRootPath { get; set; } = "uploads";

    public string LocalRequestPath { get; set; } = "/uploads";

    public bool IsAzureConfigured =>
        !string.IsNullOrWhiteSpace(ConnectionString);
}

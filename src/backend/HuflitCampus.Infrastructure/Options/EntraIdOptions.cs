namespace HuflitCampus.Infrastructure.Options;

public class EntraIdOptions
{
    public const string SectionName = "AzureAd";

    public bool Enabled { get; set; }
    public string Instance { get; set; } = "https://login.microsoftonline.com/";
    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;

    public bool IsConfigured =>
        Enabled
        && !string.IsNullOrWhiteSpace(TenantId)
        && !string.IsNullOrWhiteSpace(ClientId);
}

namespace HuflitCampus.Infrastructure.Options;

public class FcmOptions
{
    public const string SectionName = "Fcm";

    public bool Enabled { get; set; }
    public string? ServerKey { get; set; }
    public string? SenderId { get; set; }
    public string? ProjectId { get; set; }
    public string? CredentialsPath { get; set; }
}

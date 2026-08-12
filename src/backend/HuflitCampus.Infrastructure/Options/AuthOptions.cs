namespace HuflitCampus.Infrastructure.Options;

public class AuthOptions
{
    public const string SectionName = "Auth";

    /// <summary>
    /// Development-only: allow Microsoft login without validating an Entra ID token.
    /// Must remain false outside Development.
    /// </summary>
    public bool AllowDevMicrosoftBypass { get; set; }
}

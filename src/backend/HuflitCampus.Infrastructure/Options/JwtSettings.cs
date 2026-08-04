namespace HuflitCampus.Infrastructure.Options;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "HuflitCampus";
    public string Audience { get; set; } = "HuflitCampus";
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationDays { get; set; } = 14;
}

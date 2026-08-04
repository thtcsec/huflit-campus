using System.Security.Cryptography;
using System.Text;
using HuflitCampus.Application.Common.Interfaces;

namespace HuflitCampus.Infrastructure.Notifications;

public sealed class OtpService : IOtpService
{
    public TimeSpan DefaultLifetime { get; } = TimeSpan.FromMinutes(10);

    public string GenerateCode(int length = 6)
    {
        if (length is < 4 or > 10)
            throw new ArgumentOutOfRangeException(nameof(length), "OTP length must be between 4 and 10.");

        var max = (int)Math.Pow(10, length);
        var value = RandomNumberGenerator.GetInt32(0, max);
        return value.ToString($"D{length}");
    }

    public string HashCode(string code)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(Normalize(code)));
        return Convert.ToHexString(bytes);
    }

    public bool VerifyCode(string code, string hash)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(hash))
            return false;

        var computed = HashCode(code);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(hash.ToUpperInvariant()));
    }

    private static string Normalize(string code) => code.Trim();
}

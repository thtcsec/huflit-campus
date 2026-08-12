using System.Security.Cryptography;
using System.Text;

namespace HuflitCampus.Domain.Common;

public static class TokenHash
{
    public static string Compute(string rawToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(rawToken);
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken.Trim()));
        return Convert.ToHexString(bytes);
    }

    public static bool Matches(string rawToken, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(rawToken) || string.IsNullOrWhiteSpace(storedHash))
            return false;

        var computed = Compute(rawToken);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computed),
            Encoding.UTF8.GetBytes(storedHash.ToUpperInvariant()));
    }
}

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.Common.Models;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HuflitCampus.Infrastructure.Identity;

public sealed class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;
    private readonly IDateTimeProvider _dateTime;

    public JwtTokenService(IOptions<JwtSettings> options, IDateTimeProvider dateTime)
    {
        _settings = options.Value;
        _dateTime = dateTime;

        if (string.IsNullOrWhiteSpace(_settings.SecretKey) || _settings.SecretKey.Length < 32)
            throw new InvalidOperationException(
                "Jwt:SecretKey must be configured and at least 32 characters long.");
    }

    public AuthTokensDto GenerateTokens(User user)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();
        var now = _dateTime.UtcNow;

        return new AuthTokensDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = now.AddMinutes(_settings.AccessTokenExpirationMinutes),
            RefreshTokenExpiresAt = GetRefreshTokenExpiry()
        };
    }

    public string GenerateAccessToken(User user)
    {
        var now = _dateTime.UtcNow;
        var expires = now.AddMinutes(_settings.AccessTokenExpirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new("name", user.FullName),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("role", user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrWhiteSpace(user.StudentId))
            claims.Add(new Claim("student_id", user.StudentId));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
            return null;

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _settings.Issuer,
            ValidateAudience = true,
            ValidAudience = _settings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey)),
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero
        };

        var handler = new JwtSecurityTokenHandler();

        try
        {
            var principal = handler.ValidateToken(accessToken, tokenValidationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwt
                || !jwt.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public DateTime GetRefreshTokenExpiry() =>
        _dateTime.UtcNow.AddDays(_settings.RefreshTokenExpirationDays);
}

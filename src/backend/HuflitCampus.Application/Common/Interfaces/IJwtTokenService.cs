using System.Security.Claims;
using HuflitCampus.Application.Common.Models;
using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Application.Common.Interfaces;

public interface IJwtTokenService
{
    AuthTokensDto GenerateTokens(User user);
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string accessToken);
    DateTime GetRefreshTokenExpiry();
}

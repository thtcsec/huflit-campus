using System.Security.Claims;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace HuflitCampus.Infrastructure.Identity;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User?.FindFirstValue("sub");
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Email =>
        User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue("email");

    public string? FullName =>
        User?.FindFirstValue(ClaimTypes.Name)
        ?? User?.FindFirstValue("name");

    public UserRole? Role
    {
        get
        {
            var roleValue = User?.FindFirstValue(ClaimTypes.Role)
                            ?? User?.FindFirstValue("role");
            return Enum.TryParse<UserRole>(roleValue, ignoreCase: true, out var role)
                ? role
                : null;
        }
    }

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public bool IsInRole(UserRole role) =>
        User?.IsInRole(role.ToString()) == true
        || Role == role;

    public bool IsInAnyRole(params UserRole[] roles) =>
        roles.Any(IsInRole);
}

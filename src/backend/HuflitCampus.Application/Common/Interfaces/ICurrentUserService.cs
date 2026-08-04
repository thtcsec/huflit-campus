using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? FullName { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(UserRole role);
    bool IsInAnyRole(params UserRole[] roles);
}

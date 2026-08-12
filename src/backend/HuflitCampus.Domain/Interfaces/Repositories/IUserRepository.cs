using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByExternalIdAsync(string externalId, CancellationToken cancellationToken = default);
    Task<User?> FindForLoginAsync(string email, string? externalId, CancellationToken cancellationToken = default);
    Task<User?> GetByStudentIdAsync(string studentId, CancellationToken cancellationToken = default);
    Task<User?> GetWithRefreshTokensAsync(Guid userId, CancellationToken cancellationToken = default);
    void AddRefreshToken(RefreshToken refreshToken);
    Task<IReadOnlyList<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> SearchAsync(string query, int take = 20, CancellationToken cancellationToken = default);
    Task<PagedResult<User>> SearchAdminAsync(
        string? search,
        UserRole? role,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}

using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return DbSet.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken);
    }

    public Task<User?> GetByExternalIdAsync(string externalId, CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(u => u.ExternalId == externalId, cancellationToken);

    public async Task<User?> FindForLoginAsync(
        string email,
        string? externalId,
        CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var query = DbSet.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(externalId))
        {
            var byExternal = await query.FirstOrDefaultAsync(
                u => u.ExternalId == externalId,
                cancellationToken);
            if (byExternal is not null)
                return byExternal;
        }

        return await query.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken);
    }

    public Task<User?> GetByStudentIdAsync(string studentId, CancellationToken cancellationToken = default)
        => DbSet.FirstOrDefaultAsync(u => u.StudentId == studentId, cancellationToken);

    public Task<User?> GetWithRefreshTokensAsync(Guid userId, CancellationToken cancellationToken = default)
        => DbSet.Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

    public void AddRefreshToken(RefreshToken refreshToken)
        => Context.Set<RefreshToken>().Add(refreshToken);

    public async Task<IReadOnlyList<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default)
        => await DbSet.Where(u => u.Role == role && u.IsActive)
            .OrderBy(u => u.FullName)
            .ToListAsync(cancellationToken);

    public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return DbSet.AnyAsync(u => u.Email == normalized, cancellationToken);
    }

    public async Task<IReadOnlyList<User>> SearchAsync(
        string query,
        int take = 20,
        CancellationToken cancellationToken = default)
    {
        var term = query.Trim().ToLowerInvariant();
        return await DbSet
            .Where(u =>
                u.Email.ToLower().Contains(term)
                || u.FullName.ToLower().Contains(term)
                || (u.StudentId != null && u.StudentId.ToLower().Contains(term)))
            .OrderBy(u => u.FullName)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<User>> SearchAdminAsync(
        string? search,
        UserRole? role,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable().Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Email.ToLower().Contains(term)
                || u.FullName.ToLower().Contains(term)
                || (u.StudentId != null && u.StudentId.ToLower().Contains(term)));
        }

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(u => u.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<User>.Create(items, page, pageSize, total);
    }
}

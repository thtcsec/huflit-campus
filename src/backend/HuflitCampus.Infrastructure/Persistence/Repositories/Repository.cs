using System.Linq.Expressions;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HuflitCampus.Infrastructure.Persistence.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly ApplicationDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(ApplicationDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public virtual IQueryable<T> Query() => DbSet.AsQueryable();

    public virtual void Add(T entity) => DbSet.Add(entity);

    public virtual void Update(T entity) => DbSet.Update(entity);

    public virtual void SoftDelete(T entity)
    {
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        DbSet.Update(entity);
    }

    public virtual Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        => DbSet.AnyAsync(e => e.Id == id, cancellationToken);

    public virtual Task<int> CountAsync(
        Expression<Func<T, bool>>? predicate = null,
        CancellationToken cancellationToken = default)
    {
        return predicate is null
            ? DbSet.CountAsync(cancellationToken)
            : DbSet.CountAsync(predicate, cancellationToken);
    }
}

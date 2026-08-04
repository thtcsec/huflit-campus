using System.Linq.Expressions;
using HuflitCampus.Domain.Common;

namespace HuflitCampus.Domain.Interfaces.Repositories;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    IQueryable<T> Query();
    void Add(T entity);
    void Update(T entity);
    void SoftDelete(T entity);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
}

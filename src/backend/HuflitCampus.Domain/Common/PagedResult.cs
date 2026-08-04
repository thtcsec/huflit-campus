namespace HuflitCampus.Domain.Common;

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages => PageSize > 0
        ? (int)Math.Ceiling(TotalCount / (double)PageSize)
        : 0;
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public PagedResult(IReadOnlyList<T> items, int page, int pageSize, int totalCount)
    {
        Items = items;
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }

    public static PagedResult<T> Create(IReadOnlyList<T> items, int page, int pageSize, int totalCount)
        => new(items, page, pageSize, totalCount);

    public static PagedResult<T> Empty(int page = 1, int pageSize = 10)
        => new([], page, pageSize, 0);
}

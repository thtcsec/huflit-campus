namespace HuflitCampus.Application.DTOs.Common;

public class ApiResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string[]? Errors { get; set; }

    public static ApiResponse Ok(string? message = null) => new()
    {
        Success = true,
        Message = message
    };

    public static ApiResponse Fail(string message, params string[] errors) => new()
    {
        Success = false,
        Message = message,
        Errors = errors.Length > 0 ? errors : null
    };
}

public class ApiResponse<T> : ApiResponse
{
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message
    };

    public new static ApiResponse<T> Fail(string message, params string[] errors) => new()
    {
        Success = false,
        Message = message,
        Errors = errors.Length > 0 ? errors : null
    };
}

public class AnnouncementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class HomeFeedDto
{
    public List<DTOs.Events.EventListItemDto> Featured { get; set; } = [];
    public List<DTOs.Events.EventListItemDto> Today { get; set; } = [];
    public List<DTOs.Events.EventListItemDto> Trending { get; set; } = [];
    public List<DTOs.Events.EventListItemDto> Upcoming { get; set; } = [];
    public List<DTOs.Events.EventListItemDto> Recent { get; set; } = [];
    public List<DTOs.Events.EventListItemDto> Recommended { get; set; } = [];
}

namespace HuflitCampus.Application.DTOs.Ask;

public sealed class AskQueryRequestDto
{
    public string Query { get; set; } = string.Empty;
    public string? SessionId { get; set; }
}

public sealed class AskSourceDto
{
    public string Source { get; set; } = string.Empty;
    public double Score { get; set; }
    public string Text { get; set; } = string.Empty;
}

public sealed class AskQueryResponseDto
{
    public string Query { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public bool Cached { get; set; }
    public string? CacheType { get; set; }
    public string? SessionId { get; set; }
    public IReadOnlyList<AskSourceDto> Sources { get; set; } = [];
    public bool Abstained { get; set; }
    public string? Message { get; set; }
}

public sealed class AskHealthDto
{
    public bool Enabled { get; set; }
    public bool RagReachable { get; set; }
    public string Message { get; set; } = string.Empty;
}

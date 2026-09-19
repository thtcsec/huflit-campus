using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Ask;
using HuflitCampus.Domain.Common;
using HuflitCampus.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HuflitCampus.Infrastructure.Ask;

public sealed class AskRagClient(
    HttpClient httpClient,
    IOptions<AskRagOptions> options,
    ILogger<AskRagClient> logger) : IAskRagClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly AskRagOptions _options = options.Value;

    public async Task<Result<AskHealthDto>> GetHealthAsync(CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            return Result.Success(new AskHealthDto
            {
                Enabled = false,
                RagReachable = false,
                Message = "Ask HUFLIT is disabled (AskRag:Enabled=false)."
            });
        }

        try
        {
            using var request = CreateRequest(HttpMethod.Get, "/health");
            using var response = await httpClient.SendAsync(request, cancellationToken);
            var reachable = response.IsSuccessStatusCode;
            return Result.Success(new AskHealthDto
            {
                Enabled = true,
                RagReachable = reachable,
                Message = reachable
                    ? "EnterpriseRAG is reachable."
                    : $"EnterpriseRAG health returned {(int)response.StatusCode}."
            });
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Ask RAG health check failed");
            return Result.Success(new AskHealthDto
            {
                Enabled = true,
                RagReachable = false,
                Message = "EnterpriseRAG is unreachable. Start the enterprise-rag service."
            });
        }
    }

    public async Task<Result<AskLlmCatalogDto>> GetLlmCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
            return Result.Failure<AskLlmCatalogDto>("Ask HUFLIT is currently disabled.");

        try
        {
            using var request = CreateRequest(HttpMethod.Get, "/api/v1/llm/catalog");
            using var response = await httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var detail = TryExtractDetail(body) ?? $"EnterpriseRAG catalog returned {(int)response.StatusCode}.";
                return Result.Failure<AskLlmCatalogDto>(detail);
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;
            var providers = new List<AskLlmProviderDto>();

            if (root.TryGetProperty("providers", out var providersEl) && providersEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var p in providersEl.EnumerateArray())
                {
                    var models = new List<AskLlmModelDto>();
                    if (p.TryGetProperty("models", out var modelsEl) && modelsEl.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var m in modelsEl.EnumerateArray())
                        {
                            models.Add(new AskLlmModelDto
                            {
                                ModelId = m.TryGetProperty("model_id", out var mid) ? mid.GetString() ?? "" : "",
                                DisplayName = m.TryGetProperty("display_name", out var mdn) ? mdn.GetString() : null,
                                Enabled = !m.TryGetProperty("enabled", out var en) || en.ValueKind != JsonValueKind.False,
                                IsDefault = m.TryGetProperty("is_default", out var def) && def.ValueKind == JsonValueKind.True
                            });
                        }
                    }

                    providers.Add(new AskLlmProviderDto
                    {
                        Slug = p.TryGetProperty("slug", out var slug) ? slug.GetString() ?? "" : "",
                        DisplayName = p.TryGetProperty("display_name", out var dn) ? dn.GetString() ?? "" : "",
                        Enabled = !p.TryGetProperty("enabled", out var pen) || pen.ValueKind != JsonValueKind.False,
                        Configured = !p.TryGetProperty("configured", out var cfg) || cfg.ValueKind != JsonValueKind.False,
                        Models = models
                    });
                }
            }

            if (providers.Count == 0)
            {
                providers.Add(new AskLlmProviderDto
                {
                    Slug = "auto",
                    DisplayName = "Smart Router (auto)",
                    Models =
                    [
                        new AskLlmModelDto { ModelId = "auto", DisplayName = "Auto", IsDefault = true }
                    ]
                });
            }

            return Result.Success(new AskLlmCatalogDto
            {
                Source = root.TryGetProperty("source", out var src) ? src.GetString() ?? "unknown" : "unknown",
                FetchedAt = root.TryGetProperty("fetched_at", out var at) ? at.GetString() : null,
                Providers = providers
            });
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Ask RAG LLM catalog failed");
            return Result.Failure<AskLlmCatalogDto>(
                "Cannot load LLM catalog from EnterpriseRAG. Ensure it is running.");
        }
    }

    public async Task<Result<AskQueryResponseDto>> QueryAsync(
        string query,
        string? sessionId,
        string aclScope,
        AskQueryRouting routing,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
            return Result.Failure<AskQueryResponseDto>("Ask HUFLIT is currently disabled.");

        try
        {
            var payload = new RagQueryRequest
            {
                Query = query,
                Stream = false,
                SessionId = string.IsNullOrWhiteSpace(sessionId) ? null : sessionId,
                Strategy = "hybrid",
                Provider = string.IsNullOrWhiteSpace(routing.Provider) ? "auto" : routing.Provider,
                Model = string.IsNullOrWhiteSpace(routing.Model) ? "auto" : routing.Model,
                Failover = routing.Failover,
                AutoRoute = routing.AutoRoute
            };

            using var request = CreateRequest(HttpMethod.Post, "/api/v1/retrieval/query");
            if (!string.IsNullOrWhiteSpace(aclScope))
                request.Headers.TryAddWithoutValidation("X-ACL-Scope", aclScope);

            request.Content = JsonContent.Create(payload, options: JsonOptions);

            using var response = await httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Ask RAG query failed: {Status} {Body}", (int)response.StatusCode, Truncate(body));
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    return Result.Failure<AskQueryResponseDto>(
                        "EnterpriseRAG rejected the request (missing/invalid AskRag:ApiKey). " +
                        "Copy RAG_API_KEY into appsettings.Development.local.json or set env AskRag__ApiKey.");
                }

                var detail = TryExtractDetail(body) ?? $"EnterpriseRAG returned {(int)response.StatusCode}.";
                return Result.Failure<AskQueryResponseDto>(detail);
            }

            var rag = JsonSerializer.Deserialize<RagQueryResponse>(body, JsonOptions);
            if (rag is null)
                return Result.Failure<AskQueryResponseDto>("Invalid response from EnterpriseRAG.");

            var answer = rag.Answer?.Trim() ?? string.Empty;
            var abstained = string.IsNullOrWhiteSpace(answer)
                            || ContainsAbstainSignal(answer)
                            || (rag.Trace.HasValue && TraceIndicatesAbstain(rag.Trace.Value));

            var (traceProvider, traceModel) = ExtractRoutingFromTrace(rag.Trace);

            return Result.Success(new AskQueryResponseDto
            {
                Query = rag.Query ?? query,
                Answer = answer,
                Cached = rag.Cached,
                CacheType = rag.CacheType,
                SessionId = sessionId,
                Sources = (rag.Chunks ?? [])
                    .Select(c => new AskSourceDto
                    {
                        Source = c.Source ?? string.Empty,
                        Score = c.Score,
                        Text = c.Text ?? string.Empty
                    })
                    .ToList(),
                Abstained = abstained,
                Message = abstained
                    ? "Chưa đủ căn cứ trong knowledge base chính thức. Hãy hỏi phòng ban liên quan hoặc thử câu hỏi cụ thể hơn."
                    : null,
                Provider = traceProvider ?? payload.Provider,
                Model = traceModel ?? payload.Model
            });
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return Result.Failure<AskQueryResponseDto>("Ask timed out waiting for EnterpriseRAG.");
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning(ex, "Ask RAG HTTP error");
            return Result.Failure<AskQueryResponseDto>(
                "Cannot reach EnterpriseRAG. Ensure it is running (default http://localhost:8000).");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ask RAG unexpected error");
            return Result.Failure<AskQueryResponseDto>("Ask failed due to an unexpected error.");
        }
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string path)
    {
        var request = new HttpRequestMessage(method, path.TrimStart('/'));
        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            request.Headers.TryAddWithoutValidation("X-API-Key", _options.ApiKey);

        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return request;
    }

    private static string Truncate(string? value, int max = 400)
        => string.IsNullOrEmpty(value) ? string.Empty : value.Length <= max ? value : value[..max];

    private static string? TryExtractDetail(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("detail", out var detail))
                return detail.ValueKind == JsonValueKind.String ? detail.GetString() : detail.ToString();
        }
        catch (JsonException)
        {
            // ignore
        }

        return null;
    }

    private static bool ContainsAbstainSignal(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return false;

        var lower = text.ToLowerInvariant();
        return lower.Contains("không đủ căn cứ")
               || lower.Contains("khong du can cu")
               || lower.Contains("i don't know")
               || lower.Contains("i do not know")
               || lower.Contains("insufficient evidence")
               || lower.Contains("cannot find")
               || lower.Contains("no supporting");
    }

    private static bool TraceIndicatesAbstain(JsonElement trace)
    {
        if (trace.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null or JsonValueKind.False)
            return false;

        if (trace.ValueKind != JsonValueKind.Object)
            return false;

        if (trace.TryGetProperty("hallucination_blocked", out var blocked)
            && blocked.ValueKind == JsonValueKind.True)
            return true;

        if (trace.TryGetProperty("abstained", out var abstained)
            && abstained.ValueKind == JsonValueKind.True)
            return true;

        return false;
    }

    private static (string? Provider, string? Model) ExtractRoutingFromTrace(JsonElement? trace)
    {
        if (trace is null || trace.Value.ValueKind != JsonValueKind.Object)
            return (null, null);

        string? provider = null;
        string? model = null;
        var t = trace.Value;

        if (t.TryGetProperty("provider", out var p) && p.ValueKind == JsonValueKind.String)
            provider = p.GetString();
        if (t.TryGetProperty("model", out var m) && m.ValueKind == JsonValueKind.String)
            model = m.GetString();

        if ((provider is null || model is null)
            && t.TryGetProperty("routing", out var routing)
            && routing.ValueKind == JsonValueKind.Object)
        {
            if (provider is null && routing.TryGetProperty("provider", out var rp) && rp.ValueKind == JsonValueKind.String)
                provider = rp.GetString();
            if (model is null && routing.TryGetProperty("model", out var rm) && rm.ValueKind == JsonValueKind.String)
                model = rm.GetString();
            if (model is null && routing.TryGetProperty("winner_model", out var wm) && wm.ValueKind == JsonValueKind.String)
                model = wm.GetString();
        }

        return (provider, model);
    }

    private sealed class RagQueryRequest
    {
        [JsonPropertyName("query")]
        public string Query { get; set; } = string.Empty;

        [JsonPropertyName("provider")]
        public string Provider { get; set; } = "auto";

        [JsonPropertyName("model")]
        public string Model { get; set; } = "auto";

        [JsonPropertyName("strategy")]
        public string Strategy { get; set; } = "hybrid";

        [JsonPropertyName("stream")]
        public bool Stream { get; set; }

        [JsonPropertyName("failover")]
        public bool Failover { get; set; } = true;

        [JsonPropertyName("auto_route")]
        public bool AutoRoute { get; set; } = true;

        [JsonPropertyName("session_id")]
        public string? SessionId { get; set; }
    }

    private sealed class RagQueryResponse
    {
        [JsonPropertyName("query")]
        public string? Query { get; set; }

        [JsonPropertyName("answer")]
        public string? Answer { get; set; }

        [JsonPropertyName("chunks")]
        public List<RagChunk>? Chunks { get; set; }

        [JsonPropertyName("trace")]
        public JsonElement? Trace { get; set; }

        [JsonPropertyName("cached")]
        public bool Cached { get; set; }

        [JsonPropertyName("cache_type")]
        public string? CacheType { get; set; }
    }

    private sealed class RagChunk
    {
        [JsonPropertyName("source")]
        public string? Source { get; set; }

        [JsonPropertyName("score")]
        public double Score { get; set; }

        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}

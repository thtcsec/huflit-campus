using System.Text.Json;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HuflitCampus.Infrastructure.Notifications;

/// <summary>
/// Firebase Cloud Messaging stub. Logs payloads until Firebase Admin SDK credentials are wired.
/// </summary>
public sealed class FcmService : IFcmService
{
    private readonly FcmOptions _options;
    private readonly ILogger<FcmService> _logger;

    public FcmService(IOptions<FcmOptions> options, ILogger<FcmService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public Task SendAsync(
        string fcmToken,
        string title,
        string body,
        IDictionary<string, string>? data = null,
        CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            to = fcmToken,
            notification = new { title, body },
            data,
            projectId = _options.ProjectId,
            senderId = _options.SenderId
        };

        _logger.LogInformation(
            "FCM send (stub, Enabled={Enabled}): {Payload}",
            _options.Enabled,
            JsonSerializer.Serialize(payload));

        return Task.CompletedTask;
    }

    public async Task SendToManyAsync(
        IEnumerable<string> fcmTokens,
        string title,
        string body,
        IDictionary<string, string>? data = null,
        CancellationToken cancellationToken = default)
    {
        foreach (var token in fcmTokens.Where(t => !string.IsNullOrWhiteSpace(t)))
        {
            cancellationToken.ThrowIfCancellationRequested();
            await SendAsync(token, title, body, data, cancellationToken);
        }
    }
}

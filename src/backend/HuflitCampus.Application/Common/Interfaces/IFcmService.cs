namespace HuflitCampus.Application.Common.Interfaces;

public interface IFcmService
{
    Task SendAsync(
        string fcmToken,
        string title,
        string body,
        IDictionary<string, string>? data = null,
        CancellationToken cancellationToken = default);

    Task SendToManyAsync(
        IEnumerable<string> fcmTokens,
        string title,
        string body,
        IDictionary<string, string>? data = null,
        CancellationToken cancellationToken = default);
}

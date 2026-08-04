namespace HuflitCampus.Application.Common.Interfaces;

public interface IEmailSender
{
    Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default);

    Task SendPlainTextAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken = default);
}

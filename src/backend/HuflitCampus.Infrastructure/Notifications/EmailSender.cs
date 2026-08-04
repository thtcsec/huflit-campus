using System.Net;
using System.Net.Mail;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HuflitCampus.Infrastructure.Notifications;

public sealed class EmailSender : IEmailSender
{
    private readonly SmtpOptions _options;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(IOptions<SmtpOptions> options, ILogger<EmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        await SendInternalAsync(to, subject, htmlBody, isHtml: true, cancellationToken);
    }

    public async Task SendPlainTextAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        await SendInternalAsync(to, subject, body, isHtml: false, cancellationToken);
    }

    private async Task SendInternalAsync(
        string to,
        string subject,
        string body,
        bool isHtml,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation(
                "Email (dev/log): To={To}, Subject={Subject}, Body={Body}",
                to,
                subject,
                body);
            return;
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_options.FromEmail, _options.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };
        message.To.Add(to);

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.UseSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(_options.Username, _options.Password);
        }

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(message, cancellationToken);

        _logger.LogInformation("Email sent to {To} with subject {Subject}", to, subject);
    }
}

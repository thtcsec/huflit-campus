using System.Text;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Registrations.Queries;

public record ExportRegistrationsQuery(Guid EventId) : IRequest<Result<FileExportResult>>;

public record FileExportResult(byte[] Content, string ContentType, string FileName);

public class ExportRegistrationsQueryHandler : IRequestHandler<ExportRegistrationsQuery, Result<FileExportResult>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IRegistrationRepository _registrationRepository;

    public ExportRegistrationsQueryHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IRegistrationRepository registrationRepository)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _registrationRepository = registrationRepository;
    }

    public async Task<Result<FileExportResult>> Handle(ExportRegistrationsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var evt = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        var isOwner = evt.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException();

        var registrations = await _registrationRepository.GetByEventAsync(
            request.EventId, page: 1, pageSize: 2000, status: null, cancellationToken: cancellationToken);

        var sb = new StringBuilder();
        // UTF-8 BOM for Microsoft Excel
        sb.Append('\uFEFF');
        sb.AppendLine("STT,MSSV/ID,Ho va Ten,Email,Khoa,Nganh,Trang Thai,Ma Ve,Hang Doi,Ngay Dang Ky");

        int stt = 1;
        foreach (var reg in registrations.Items)
        {
            var user = reg.User;
            var mssv = EscapeCsv(user?.StudentId ?? "");
            var name = EscapeCsv(user?.FullName ?? "N/A");
            var email = EscapeCsv(user?.Email ?? "");
            var faculty = EscapeCsv(user?.Faculty ?? "");
            var major = EscapeCsv(user?.Major ?? "");
            var status = EscapeCsv(reg.Status.ToString());
            var ticket = EscapeCsv(reg.TicketCode ?? "");
            var waitlist = reg.WaitlistPosition?.ToString() ?? "";
            var regDate = reg.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");

            sb.AppendLine($"{stt},{mssv},{name},{email},{faculty},{major},{status},{ticket},{waitlist},{regDate}");
            stt++;
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fileName = $"Registrations_{SanitizeFileName(evt.Title)}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return Result.Success(new FileExportResult(bytes, "text/csv; charset=utf-8", fileName));
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        return value;
    }

    private static string SanitizeFileName(string fileName)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
        {
            fileName = fileName.Replace(c, '_');
        }
        return fileName.Replace(' ', '_');
    }
}

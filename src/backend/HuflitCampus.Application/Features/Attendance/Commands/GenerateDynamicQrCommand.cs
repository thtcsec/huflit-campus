using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Attendance.Commands;

public record GenerateDynamicQrCommand(GenerateQrRequest Request) : IRequest<Result<QrPayloadDto>>;

public class GenerateDynamicQrCommandHandler : IRequestHandler<GenerateDynamicQrCommand, Result<QrPayloadDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IQrTokenRepository _qrTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public GenerateDynamicQrCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IQrTokenRepository qrTokenRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IDateTimeProvider dateTime)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _qrTokenRepository = qrTokenRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _dateTime = dateTime;
    }

    public async Task<Result<QrPayloadDto>> Handle(GenerateDynamicQrCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var evt = await _eventRepository.GetByIdAsync(request.Request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.Request.EventId);

        var isOwner = evt.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);
        if (!isOwner && !isAdmin)
            throw new ForbiddenException("Only organizers can generate QR codes.");

        if (evt.Status is not (EventStatus.Published or EventStatus.RegistrationClosed))
            return Result.Failure<QrPayloadDto>("QR codes can only be generated for published events.");

        var validitySeconds = request.Request.ValiditySeconds is < 10 or > 300
            ? 30
            : request.Request.ValiditySeconds;

        await _qrTokenRepository.InvalidateActiveTokensAsync(evt.Id, cancellationToken);

        var sequence = await _qrTokenRepository.GetNextSequenceAsync(evt.Id, cancellationToken);
        var tokenValue = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

        var qr = QrToken.Create(
            evt.Id,
            tokenValue,
            _dateTime.UtcNow.AddSeconds(validitySeconds),
            sequence,
            request.Request.IsSingleUse);

        _qrTokenRepository.Add(qr);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<QrPayloadDto>(qr);
        dto.EventTitle = evt.Title;
        return Result.Success(dto);
    }
}

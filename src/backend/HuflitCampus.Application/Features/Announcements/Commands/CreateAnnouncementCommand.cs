using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Announcements.Commands;

public record CreateAnnouncementCommand(
    string Title,
    string Body,
    bool IsPinned = false,
    DateTime? PublishedAt = null,
    DateTime? ExpiresAt = null) : IRequest<Result<AnnouncementDto>>;

public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, Result<AnnouncementDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAnnouncementRepository _announcementRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateAnnouncementCommandHandler(
        ICurrentUserService currentUser,
        IAnnouncementRepository announcementRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _currentUser = currentUser;
        _announcementRepository = announcementRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<AnnouncementDto>> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (string.IsNullOrWhiteSpace(request.Title))
            return Result.Failure<AnnouncementDto>("Title is required.");

        if (string.IsNullOrWhiteSpace(request.Body))
            return Result.Failure<AnnouncementDto>("Body content is required.");

        var announcement = Announcement.Create(
            request.Title.Trim(),
            request.Body.Trim(),
            _currentUser.UserId.Value,
            request.IsPinned,
            request.PublishedAt ?? DateTime.UtcNow,
            request.ExpiresAt);

        _announcementRepository.Add(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<AnnouncementDto>(announcement));
    }
}

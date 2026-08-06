using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Announcements.Commands;

public record UpdateAnnouncementCommand(
    Guid Id,
    string Title,
    string Body,
    bool IsPinned,
    DateTime? PublishedAt,
    DateTime? ExpiresAt) : IRequest<Result<AnnouncementDto>>;

public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand, Result<AnnouncementDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAnnouncementRepository _announcementRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateAnnouncementCommandHandler(
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

    public async Task<Result<AnnouncementDto>> Handle(UpdateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var announcement = await _announcementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (announcement is null || announcement.IsDeleted)
            throw new NotFoundException(nameof(Announcement), request.Id);

        if (string.IsNullOrWhiteSpace(request.Title))
            return Result.Failure<AnnouncementDto>("Title is required.");

        if (string.IsNullOrWhiteSpace(request.Body))
            return Result.Failure<AnnouncementDto>("Body content is required.");

        announcement.Title = request.Title.Trim();
        announcement.Body = request.Body.Trim();
        announcement.IsPinned = request.IsPinned;
        announcement.PublishedAt = request.PublishedAt ?? announcement.PublishedAt;
        announcement.ExpiresAt = request.ExpiresAt;
        announcement.UpdatedAt = DateTime.UtcNow;

        _announcementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(_mapper.Map<AnnouncementDto>(announcement));
    }
}

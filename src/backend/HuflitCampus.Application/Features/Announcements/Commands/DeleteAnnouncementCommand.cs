using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Announcements.Commands;

public record DeleteAnnouncementCommand(Guid Id) : IRequest<Result>;

public class DeleteAnnouncementCommandHandler : IRequestHandler<DeleteAnnouncementCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAnnouncementRepository _announcementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAnnouncementCommandHandler(
        ICurrentUserService currentUser,
        IAnnouncementRepository announcementRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _announcementRepository = announcementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteAnnouncementCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var announcement = await _announcementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (announcement is null || announcement.IsDeleted)
            throw new NotFoundException(nameof(Announcement), request.Id);

        announcement.SoftDelete(_currentUser.UserId.Value.ToString());
        _announcementRepository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

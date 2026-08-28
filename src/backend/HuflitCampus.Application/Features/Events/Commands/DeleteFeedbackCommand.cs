using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Commands;

public record DeleteFeedbackCommand(Guid EventId, Guid FeedbackId) : IRequest<Result<bool>>;

public class DeleteFeedbackCommandHandler : IRequestHandler<DeleteFeedbackCommand, Result<bool>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IRepository<EventFeedback> _feedbackRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFeedbackCommandHandler(
        ICurrentUserService currentUser,
        IRepository<EventFeedback> feedbackRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _feedbackRepository = feedbackRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteFeedbackCommand command, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var feedback = await _feedbackRepository.GetByIdAsync(command.FeedbackId, cancellationToken);
        if (feedback is null || feedback.EventId != command.EventId || feedback.IsDeleted)
            return Result.Failure<bool>("Feedback not found.");

        var isOwner = feedback.UserId == _currentUser.UserId.Value;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.Administrator, UserRole.FacultyManager);

        if (!isOwner && !isAdmin)
            throw new ForbiddenException("You do not have permission to delete this feedback.");

        _feedbackRepository.SoftDelete(feedback);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

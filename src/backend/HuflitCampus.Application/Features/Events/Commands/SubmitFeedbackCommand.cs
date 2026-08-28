using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Commands;

public record SubmitFeedbackCommand(
    Guid EventId,
    CreateEventFeedbackRequest Request) : IRequest<Result<EventFeedbackDto>>;

public class SubmitFeedbackCommandHandler : IRequestHandler<SubmitFeedbackCommand, Result<EventFeedbackDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRepository<EventFeedback> _feedbackRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitFeedbackCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IUserRepository userRepository,
        IRepository<EventFeedback> feedbackRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _userRepository = userRepository;
        _feedbackRepository = feedbackRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EventFeedbackDto>> Handle(
        SubmitFeedbackCommand command,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var userId = _currentUser.UserId.Value;
        var ev = await _eventRepository.GetByIdAsync(command.EventId, cancellationToken);
        if (ev is null)
            return Result.Failure<EventFeedbackDto>("Event not found.");

        var req = command.Request;
        if (req.Rating < 1 || req.Rating > 5)
            return Result.Failure<EventFeedbackDto>("Rating must be between 1 and 5 stars.");

        if (string.IsNullOrWhiteSpace(req.Comment))
            return Result.Failure<EventFeedbackDto>("Feedback comment cannot be empty.");

        // Check if user already submitted feedback for this event
        var existing = _feedbackRepository.Query()
            .FirstOrDefault(f => f.EventId == command.EventId && f.UserId == userId && !f.IsDeleted);

        EventFeedback feedback;
        if (existing is not null)
        {
            existing.Rating = Math.Clamp(req.Rating, 1, 5);
            existing.Comment = req.Comment.Trim();
            existing.IsAnonymous = req.IsAnonymous;
            existing.UpdatedAt = DateTime.UtcNow;
            _feedbackRepository.Update(existing);
            feedback = existing;
        }
        else
        {
            feedback = EventFeedback.Create(
                command.EventId,
                userId,
                req.Rating,
                req.Comment,
                req.IsAnonymous);
            _feedbackRepository.Add(feedback);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        return Result.Success(new EventFeedbackDto
        {
            Id = feedback.Id,
            EventId = feedback.EventId,
            UserId = feedback.UserId,
            UserName = feedback.IsAnonymous ? "Ẩn danh (HUFLIT Student)" : (user?.FullName ?? "HUFLIT User"),
            UserAvatar = feedback.IsAnonymous ? null : user?.AvatarUrl,
            Rating = feedback.Rating,
            Comment = feedback.Comment,
            IsAnonymous = feedback.IsAnonymous,
            CreatedAt = feedback.CreatedAt
        });
    }
}

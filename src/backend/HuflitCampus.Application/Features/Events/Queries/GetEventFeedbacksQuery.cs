using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Queries;

public record GetEventFeedbacksQuery(Guid EventId) : IRequest<Result<EventFeedbackSummaryDto>>;

public class GetEventFeedbacksQueryHandler : IRequestHandler<GetEventFeedbacksQuery, Result<EventFeedbackSummaryDto>>
{
    private readonly IRepository<EventFeedback> _feedbackRepository;
    private readonly IUserRepository _userRepository;

    public GetEventFeedbacksQueryHandler(
        IRepository<EventFeedback> feedbackRepository,
        IUserRepository userRepository)
    {
        _feedbackRepository = feedbackRepository;
        _userRepository = userRepository;
    }

    public Task<Result<EventFeedbackSummaryDto>> Handle(
        GetEventFeedbacksQuery request,
        CancellationToken cancellationToken)
    {
        var rawList = _feedbackRepository.Query()
            .Where(f => f.EventId == request.EventId && !f.IsDeleted)
            .OrderByDescending(f => f.CreatedAt)
            .ToList();

        if (rawList.Count == 0)
        {
            return Task.FromResult(Result.Success(new EventFeedbackSummaryDto
            {
                AverageRating = 5.0,
                TotalFeedbacks = 0,
                RatingCounts = new Dictionary<int, int> { { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 } },
                Items = []
            }));
        }

        var userIds = rawList.Where(f => !f.IsAnonymous).Select(f => f.UserId).Distinct().ToList();
        var users = _userRepository.Query()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionary(u => u.Id, u => u);

        var items = rawList.Select(f =>
        {
            var user = (!f.IsAnonymous && users.TryGetValue(f.UserId, out var u)) ? u : null;
            return new EventFeedbackDto
            {
                Id = f.Id,
                EventId = f.EventId,
                UserId = f.UserId,
                UserName = f.IsAnonymous ? "Ẩn danh (HUFLIT Student)" : (user?.FullName ?? "HUFLIT User"),
                UserAvatar = f.IsAnonymous ? null : user?.AvatarUrl,
                Rating = f.Rating,
                Comment = f.Comment,
                IsAnonymous = f.IsAnonymous,
                CreatedAt = f.CreatedAt
            };
        }).ToList();

        var ratingCounts = new Dictionary<int, int>
        {
            { 5, rawList.Count(f => f.Rating == 5) },
            { 4, rawList.Count(f => f.Rating == 4) },
            { 3, rawList.Count(f => f.Rating == 3) },
            { 2, rawList.Count(f => f.Rating == 2) },
            { 1, rawList.Count(f => f.Rating == 1) },
        };

        var avg = Math.Round(rawList.Average(f => f.Rating), 1);

        return Task.FromResult(Result.Success(new EventFeedbackSummaryDto
        {
            AverageRating = avg,
            TotalFeedbacks = rawList.Count,
            RatingCounts = ratingCounts,
            Items = items
        }));
    }
}

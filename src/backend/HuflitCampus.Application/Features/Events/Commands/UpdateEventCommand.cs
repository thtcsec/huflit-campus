using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Enums;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Events.Commands;

public record UpdateEventCommand(Guid EventId, UpdateEventRequest Request) : IRequest<Result<EventDetailDto>>;

public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand, Result<EventDetailDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public UpdateEventCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IDateTimeProvider dateTime)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _dateTime = dateTime;
    }

    public async Task<Result<EventDetailDto>> Handle(UpdateEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var entity = await _eventRepository.GetWithDetailsAsync(request.EventId, cancellationToken);
        if (entity is null || entity.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        EnsureCanManage(entity);

        if (entity.Status is EventStatus.Cancelled or EventStatus.Completed)
            return Result.Failure<EventDetailDto>($"Cannot update event in status '{entity.Status}'.");

        var req = request.Request;
        entity.Title = req.Title.Trim();
        entity.Description = req.Description.Trim();
        entity.Agenda = req.Agenda;
        entity.BannerUrl = req.BannerUrl;
        entity.Category = req.Category;
        entity.Faculty = req.Faculty;
        entity.LocationName = req.LocationName.Trim();
        entity.Address = req.Address;
        entity.Latitude = req.Latitude;
        entity.Longitude = req.Longitude;
        entity.GoogleMapsUrl = req.GoogleMapsUrl;
        entity.Capacity = req.Capacity;
        entity.WaitlistEnabled = req.WaitlistEnabled;
        entity.MaxWaitlist = req.MaxWaitlist;
        entity.RegistrationDeadline = req.RegistrationDeadline;
        entity.CheckInStart = req.CheckInStart;
        entity.CheckInEnd = req.CheckInEnd;
        entity.StartAt = req.StartAt;
        entity.EndAt = req.EndAt;
        entity.Requirements = req.Requirements;
        entity.Sponsor = req.Sponsor;
        entity.UpdatedAt = _dateTime.UtcNow;
        entity.UpdatedBy = _currentUser.UserId.Value.ToString();

        if (_currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator))
            entity.IsFeatured = req.IsFeatured;

        if (req.Speakers is not null)
        {
            entity.Speakers.Clear();
            var order = 0;
            foreach (var speaker in req.Speakers)
            {
                entity.Speakers.Add(EventSpeaker.Create(
                    entity.Id,
                    speaker.Name,
                    speaker.Title,
                    speaker.Bio,
                    speaker.AvatarUrl,
                    speaker.SortOrder > 0 ? speaker.SortOrder : order++));
            }
        }

        if (req.Media is not null)
        {
            entity.Media.Clear();
            var order = 0;
            foreach (var media in req.Media)
            {
                var mediaType = Enum.TryParse<MediaType>(media.MediaType, true, out var parsed)
                    ? parsed
                    : MediaType.Image;

                entity.Media.Add(EventMedia.Create(
                    entity.Id,
                    media.Url,
                    mediaType,
                    media.SortOrder > 0 ? media.SortOrder : order++,
                    media.Caption));
            }
        }

        _eventRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _eventRepository.GetWithDetailsAsync(entity.Id, cancellationToken) ?? entity;
        return Result.Success(_mapper.Map<EventDetailDto>(updated));
    }

    private void EnsureCanManage(Event entity)
    {
        var isOwner = entity.OrganizerId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator);

        if (!isOwner && !isAdmin)
            throw new ForbiddenException("You cannot update this event.");
    }
}

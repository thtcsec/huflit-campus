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

public record CreateEventCommand(CreateEventRequest Request) : IRequest<Result<EventDetailDto>>;

public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, Result<EventDetailDto>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IDateTimeProvider _dateTime;

    public CreateEventCommandHandler(
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

    public async Task<Result<EventDetailDto>> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        if (!_currentUser.IsInAnyRole(
                UserRole.Lecturer,
                UserRole.ClubManager,
                UserRole.FacultyManager,
                UserRole.Administrator))
        {
            throw new ForbiddenException("You are not allowed to create events.");
        }

        var req = request.Request;
        var baseSlug = DependencyInjection.ToSlug(req.Title);
        var slug = baseSlug;
        var suffix = 1;
        while (await _eventRepository.SlugExistsAsync(slug, cancellationToken: cancellationToken))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        var entity = new Event
        {
            Title = req.Title.Trim(),
            Slug = slug,
            Description = req.Description.Trim(),
            Agenda = req.Agenda,
            BannerUrl = req.BannerUrl,
            Category = req.Category,
            Status = EventStatus.Draft,
            OrganizerId = _currentUser.UserId.Value,
            Faculty = req.Faculty,
            LocationName = req.LocationName.Trim(),
            Address = req.Address,
            Latitude = req.Latitude,
            Longitude = req.Longitude,
            GoogleMapsUrl = req.GoogleMapsUrl,
            Capacity = req.Capacity,
            WaitlistEnabled = req.WaitlistEnabled,
            MaxWaitlist = req.MaxWaitlist,
            RegistrationDeadline = req.RegistrationDeadline,
            CheckInStart = req.CheckInStart,
            CheckInEnd = req.CheckInEnd,
            StartAt = req.StartAt,
            EndAt = req.EndAt,
            Requirements = req.Requirements,
            Sponsor = req.Sponsor,
            IsFeatured = req.IsFeatured && _currentUser.IsInAnyRole(UserRole.FacultyManager, UserRole.Administrator),
            CreatedAt = _dateTime.UtcNow,
            CreatedBy = _currentUser.UserId.Value.ToString()
        };

        if (req.Speakers is { Count: > 0 })
        {
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

        if (req.Media is { Count: > 0 })
        {
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

        _eventRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _eventRepository.GetWithDetailsAsync(entity.Id, cancellationToken)
                      ?? entity;

        return Result.Success(_mapper.Map<EventDetailDto>(created));
    }
}

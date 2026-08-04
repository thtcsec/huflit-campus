using AutoMapper;
using HuflitCampus.Application.DTOs.Attendance;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Application.DTOs.Calendar;
using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Application.DTOs.Events;
using HuflitCampus.Application.DTOs.Notifications;
using HuflitCampus.Application.DTOs.Registrations;
using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserProfileDto>()
            .ForMember(d => d.AuthProvider, opt => opt.MapFrom(s => s.AuthProvider.ToString()))
            .ForMember(d => d.HasFcmToken, opt => opt.MapFrom(s => !string.IsNullOrWhiteSpace(s.FcmToken)));

        CreateMap<Event, EventListItemDto>()
            .ForMember(d => d.RemainingSeats, opt => opt.MapFrom(s => s.RemainingSeats))
            .ForMember(d => d.OrganizerName, opt => opt.MapFrom(s => s.Organizer != null ? s.Organizer.FullName : null))
            .ForMember(d => d.IsSaved, opt => opt.Ignore())
            .ForMember(d => d.IsRegistered, opt => opt.Ignore());

        CreateMap<Event, EventDetailDto>()
            .IncludeBase<Event, EventListItemDto>()
            .ForMember(d => d.Media, opt => opt.MapFrom(s => s.Media.OrderBy(m => m.SortOrder)))
            .ForMember(d => d.Speakers, opt => opt.MapFrom(s => s.Speakers.OrderBy(sp => sp.SortOrder)));

        CreateMap<EventMedia, EventMediaDto>()
            .ForMember(d => d.MediaType, opt => opt.MapFrom(s => s.MediaType.ToString()));

        CreateMap<EventSpeaker, EventSpeakerDto>();

        CreateMap<EventRegistration, RegistrationDto>()
            .ForMember(d => d.EventTitle, opt => opt.MapFrom(s => s.Event != null ? s.Event.Title : null))
            .ForMember(d => d.EventBannerUrl, opt => opt.MapFrom(s => s.Event != null ? s.Event.BannerUrl : null))
            .ForMember(d => d.EventStartAt, opt => opt.MapFrom(s => s.Event != null ? s.Event.StartAt : (DateTime?)null))
            .ForMember(d => d.UserFullName, opt => opt.MapFrom(s => s.User != null ? s.User.FullName : null))
            .ForMember(d => d.UserEmail, opt => opt.MapFrom(s => s.User != null ? s.User.Email : null))
            .ForMember(d => d.UserAvatarUrl, opt => opt.MapFrom(s => s.User != null ? s.User.AvatarUrl : null));

        CreateMap<AttendanceRecord, AttendanceDto>()
            .ForMember(d => d.EventTitle, opt => opt.MapFrom(s => s.Event != null ? s.Event.Title : null))
            .ForMember(d => d.UserFullName, opt => opt.MapFrom(s => s.User != null ? s.User.FullName : null))
            .ForMember(d => d.UserEmail, opt => opt.MapFrom(s => s.User != null ? s.User.Email : null));

        CreateMap<Notification, NotificationDto>();

        CreateMap<Announcement, AnnouncementDto>();

        CreateMap<Event, CalendarEventDto>()
            .ForMember(d => d.IsRegistered, opt => opt.Ignore());

        CreateMap<QrToken, QrPayloadDto>()
            .ForMember(d => d.EventTitle, opt => opt.MapFrom(s => s.Event != null ? s.Event.Title : null));
    }
}

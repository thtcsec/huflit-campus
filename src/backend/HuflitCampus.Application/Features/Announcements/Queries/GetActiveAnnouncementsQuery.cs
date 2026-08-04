using AutoMapper;
using HuflitCampus.Application.DTOs.Common;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Announcements.Queries;

public record GetActiveAnnouncementsQuery(int Page = 1, int PageSize = 10)
    : IRequest<Result<PagedResult<AnnouncementDto>>>;

public class GetActiveAnnouncementsQueryHandler
    : IRequestHandler<GetActiveAnnouncementsQuery, Result<PagedResult<AnnouncementDto>>>
{
    private readonly IAnnouncementRepository _announcementRepository;
    private readonly IMapper _mapper;

    public GetActiveAnnouncementsQueryHandler(
        IAnnouncementRepository announcementRepository,
        IMapper mapper)
    {
        _announcementRepository = announcementRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<AnnouncementDto>>> Handle(
        GetActiveAnnouncementsQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 50 ? 10 : request.PageSize;

        var paged = await _announcementRepository.GetActiveAsync(page, pageSize, cancellationToken);
        var items = _mapper.Map<List<AnnouncementDto>>(paged.Items);

        return Result.Success(PagedResult<AnnouncementDto>.Create(items, paged.Page, paged.PageSize, paged.TotalCount));
    }
}

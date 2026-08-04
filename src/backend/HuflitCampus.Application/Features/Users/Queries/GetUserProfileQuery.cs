using AutoMapper;
using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.DTOs.Auth;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.Users.Queries;

public record GetUserProfileQuery(Guid UserId) : IRequest<Result<UserProfileDto>>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetUserProfileQueryHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<Result<UserProfileDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
            throw new NotFoundException(nameof(Domain.Entities.User), request.UserId);

        return Result.Success(_mapper.Map<UserProfileDto>(user));
    }
}

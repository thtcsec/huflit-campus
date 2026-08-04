using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.SavedEvents.Commands;

public record UnsaveEventCommand(Guid EventId) : IRequest<Result>;

public class UnsaveEventCommandHandler : IRequestHandler<UnsaveEventCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly ISavedEventRepository _savedEventRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UnsaveEventCommandHandler(
        ICurrentUserService currentUser,
        IEventRepository eventRepository,
        ISavedEventRepository savedEventRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _eventRepository = eventRepository;
        _savedEventRepository = savedEventRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UnsaveEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var evt = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        if (!await _savedEventRepository.IsSavedAsync(_currentUser.UserId.Value, evt.Id, cancellationToken))
            return Result.Success();

        await _savedEventRepository.RemoveAsync(_currentUser.UserId.Value, evt.Id, cancellationToken);
        evt.DecrementSaveCount();
        _eventRepository.Update(evt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

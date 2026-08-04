using HuflitCampus.Application.Common.Exceptions;
using HuflitCampus.Application.Common.Interfaces;
using HuflitCampus.Domain.Common;
using HuflitCampus.Domain.Entities;
using HuflitCampus.Domain.Interfaces.Repositories;
using MediatR;

namespace HuflitCampus.Application.Features.SavedEvents.Commands;

public record SaveEventCommand(Guid EventId) : IRequest<Result>;

public class SaveEventCommandHandler : IRequestHandler<SaveEventCommand, Result>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IEventRepository _eventRepository;
    private readonly ISavedEventRepository _savedEventRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SaveEventCommandHandler(
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

    public async Task<Result> Handle(SaveEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedAppException();

        var evt = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken);
        if (evt is null || evt.IsDeleted)
            throw new NotFoundException(nameof(Event), request.EventId);

        if (await _savedEventRepository.IsSavedAsync(_currentUser.UserId.Value, evt.Id, cancellationToken))
            return Result.Success();

        _savedEventRepository.Add(SavedEvent.Create(_currentUser.UserId.Value, evt.Id));
        evt.IncrementSaveCount();
        _eventRepository.Update(evt);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

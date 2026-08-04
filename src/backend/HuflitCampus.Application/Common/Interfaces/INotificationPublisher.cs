using HuflitCampus.Domain.Entities;

namespace HuflitCampus.Application.Common.Interfaces;

public interface INotificationPublisher
{
    Task PublishAsync(Notification notification, CancellationToken cancellationToken = default);

    Task PublishManyAsync(
        IEnumerable<Notification> notifications,
        CancellationToken cancellationToken = default);
}

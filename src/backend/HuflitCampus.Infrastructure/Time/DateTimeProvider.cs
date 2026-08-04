using HuflitCampus.Application.Common.Interfaces;

namespace HuflitCampus.Infrastructure.Time;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}

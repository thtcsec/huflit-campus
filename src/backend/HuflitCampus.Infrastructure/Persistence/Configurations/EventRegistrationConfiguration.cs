using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class EventRegistrationConfiguration : IEntityTypeConfiguration<EventRegistration>
{
    public void Configure(EntityTypeBuilder<EventRegistration> builder)
    {
        builder.ToTable("EventRegistrations");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.TicketCode).HasMaxLength(50);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => new { x.EventId, x.UserId }).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasIndex(x => x.TicketCode).IsUnique().HasFilter("[TicketCode] IS NOT NULL AND [IsDeleted] = 0");
        builder.HasIndex(x => new { x.EventId, x.Status });
        builder.HasIndex(x => x.UserId);

        // Attendance FK delete behavior is configured on AttendanceRecordConfiguration
        // (NoAction) to avoid SQL Server multiple cascade path errors.
    }
}

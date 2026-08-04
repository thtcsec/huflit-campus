using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class AttendanceRecordConfiguration : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> builder)
    {
        builder.ToTable("AttendanceRecords");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.DeviceInfo).HasMaxLength(500);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => new { x.RegistrationId, x.Type });
        builder.HasIndex(x => x.EventId);
        builder.HasIndex(x => x.UserId);

        builder.HasOne(x => x.Event)
            .WithMany()
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Restrict to avoid SQL Server multiple cascade paths
        // (Event → QrTokens CASCADE and Event → Registrations → Attendance CASCADE).
        builder.HasOne(x => x.QrToken)
            .WithMany()
            .HasForeignKey(x => x.QrTokenId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.Registration)
            .WithMany(x => x.AttendanceRecords)
            .HasForeignKey(x => x.RegistrationId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

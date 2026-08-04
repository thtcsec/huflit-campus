using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Body).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.DataJson).HasMaxLength(4000);
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAt });
    }
}

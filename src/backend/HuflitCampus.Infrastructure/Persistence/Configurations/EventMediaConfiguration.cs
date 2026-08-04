using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class EventMediaConfiguration : IEntityTypeConfiguration<EventMedia>
{
    public void Configure(EntityTypeBuilder<EventMedia> builder)
    {
        builder.ToTable("EventMedia");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Url).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Caption).HasMaxLength(500);
        builder.Property(x => x.MediaType).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => new { x.EventId, x.SortOrder });
    }
}

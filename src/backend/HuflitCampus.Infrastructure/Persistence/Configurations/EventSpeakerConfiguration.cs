using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class EventSpeakerConfiguration : IEntityTypeConfiguration<EventSpeaker>
{
    public void Configure(EntityTypeBuilder<EventSpeaker> builder)
    {
        builder.ToTable("EventSpeakers");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(200);
        builder.Property(x => x.Bio).HasMaxLength(2000);
        builder.Property(x => x.AvatarUrl).HasMaxLength(1000);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => new { x.EventId, x.SortOrder });
    }
}

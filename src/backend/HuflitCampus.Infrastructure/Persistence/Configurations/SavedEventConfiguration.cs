using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class SavedEventConfiguration : IEntityTypeConfiguration<SavedEvent>
{
    public void Configure(EntityTypeBuilder<SavedEvent> builder)
    {
        builder.ToTable("SavedEvents");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => new { x.UserId, x.EventId }).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasIndex(x => x.UserId);
    }
}

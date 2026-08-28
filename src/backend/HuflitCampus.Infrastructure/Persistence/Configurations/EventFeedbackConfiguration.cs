using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class EventFeedbackConfiguration : IEntityTypeConfiguration<EventFeedback>
{
    public void Configure(EntityTypeBuilder<EventFeedback> builder)
    {
        builder.ToTable("EventFeedbacks");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Rating).IsRequired();
        builder.Property(x => x.Comment).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.IsAnonymous).HasDefaultValue(false);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasOne(x => x.Event)
            .WithMany(x => x.Feedbacks)
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.EventId);
        builder.HasIndex(x => x.UserId);
    }
}

using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(350).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(8000).IsRequired();
        builder.Property(x => x.Agenda).HasMaxLength(8000);
        builder.Property(x => x.BannerUrl).HasMaxLength(1000);
        builder.Property(x => x.Faculty).HasMaxLength(200);
        builder.Property(x => x.LocationName).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.GoogleMapsUrl).HasMaxLength(1000);
        builder.Property(x => x.Requirements).HasMaxLength(2000);
        builder.Property(x => x.Sponsor).HasMaxLength(300);
        builder.Property(x => x.RejectionReason).HasMaxLength(1000);
        builder.Property(x => x.Category).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.Ignore(x => x.RemainingSeats);
        builder.Ignore(x => x.HasAvailableSeats);
        builder.Ignore(x => x.IsRegistrationOpen);

        builder.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.StartAt);
        builder.HasIndex(x => x.OrganizerId);
        builder.HasIndex(x => new { x.IsFeatured, x.Status });

        builder.HasOne(x => x.Organizer)
            .WithMany()
            .HasForeignKey(x => x.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ApprovedBy)
            .WithMany()
            .HasForeignKey(x => x.ApprovedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Media)
            .WithOne(x => x.Event)
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Speakers)
            .WithOne(x => x.Event)
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Registrations)
            .WithOne(x => x.Event)
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.QrTokens)
            .WithOne(x => x.Event)
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.SavedByUsers)
            .WithOne(x => x.Event)
            .HasForeignKey(x => x.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

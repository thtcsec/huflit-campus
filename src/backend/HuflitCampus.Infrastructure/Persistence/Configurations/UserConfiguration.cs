using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.AvatarUrl).HasMaxLength(1000);
        builder.Property(x => x.StudentId).HasMaxLength(50);
        builder.Property(x => x.Faculty).HasMaxLength(200);
        builder.Property(x => x.Major).HasMaxLength(200);
        builder.Property(x => x.ExternalId).HasMaxLength(128);
        builder.Property(x => x.Phone).HasMaxLength(30);
        builder.Property(x => x.FcmToken).HasMaxLength(512);
        builder.Property(x => x.Role).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.AuthProvider).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.HasIndex(x => x.Email).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasIndex(x => x.ExternalId).HasFilter("[ExternalId] IS NOT NULL AND [IsDeleted] = 0");
        builder.HasIndex(x => x.StudentId).HasFilter("[StudentId] IS NOT NULL AND [IsDeleted] = 0");

        builder.HasMany(x => x.RefreshTokens)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Achievements)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Registrations)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.SavedEvents)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Notifications)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

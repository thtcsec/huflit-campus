using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class OtpChallengeConfiguration : IEntityTypeConfiguration<OtpChallenge>
{
    public void Configure(EntityTypeBuilder<OtpChallenge> builder)
    {
        builder.ToTable("OtpChallenges");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.CodeHash).HasMaxLength(128).IsRequired();
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.Ignore(x => x.IsExpired);
        builder.Ignore(x => x.IsValid);

        builder.HasIndex(x => new { x.Email, x.CreatedAt });
        builder.HasIndex(x => x.ExpiresAt);
    }
}

using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Token).HasMaxLength(512).IsRequired();
        builder.Property(x => x.ReplacedByToken).HasMaxLength(512);
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.Ignore(x => x.IsExpired);
        builder.Ignore(x => x.IsRevoked);
        builder.Ignore(x => x.IsActive);

        builder.HasIndex(x => x.Token).IsUnique();
        builder.HasIndex(x => x.UserId);
    }
}

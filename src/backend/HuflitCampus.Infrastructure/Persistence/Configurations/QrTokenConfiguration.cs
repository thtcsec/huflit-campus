using HuflitCampus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HuflitCampus.Infrastructure.Persistence.Configurations;

public class QrTokenConfiguration : IEntityTypeConfiguration<QrToken>
{
    public void Configure(EntityTypeBuilder<QrToken> builder)
    {
        builder.ToTable("QrTokens");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Token).HasMaxLength(128).IsRequired();
        builder.Property(x => x.CreatedBy).HasMaxLength(64);
        builder.Property(x => x.UpdatedBy).HasMaxLength(64);

        builder.Ignore(x => x.IsExpired);
        builder.Ignore(x => x.IsUsed);
        builder.Ignore(x => x.IsValid);

        builder.HasIndex(x => x.Token).IsUnique();
        builder.HasIndex(x => new { x.EventId, x.Sequence });
        builder.HasIndex(x => new { x.EventId, x.ExpiresAt });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Configurations;

/// <summary>
/// Entity Framework Core configuration for the <see cref="Feature"/> entity.
/// </summary>
public class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
    public void Configure(EntityTypeBuilder<Feature> builder)
    {
        builder.ToTable("Features");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(f => f.Code)
            .IsUnique();

        builder.Property(f => f.Description)
            .HasMaxLength(500);

        builder.Property(f => f.Status)
            .IsRequired()
            .HasDefaultValue(FeatureStatus.Active);

        builder.Property(f => f.CreatedBy)
            .HasMaxLength(100);

        builder.Property(f => f.CreatedAt)
            .IsRequired();
    }
}

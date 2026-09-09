using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Configurations;

/// <summary>
/// Entity Framework Core configuration for the <see cref="PlanFeature"/> entity.
/// </summary>
public class PlanFeatureConfiguration : IEntityTypeConfiguration<PlanFeature>
{
    public void Configure(EntityTypeBuilder<PlanFeature> builder)
    {
        builder.ToTable("PlanFeatures");

        builder.HasKey(pf => pf.Id);

        // Unique index for PlanId and FeatureId combination
        builder.HasIndex(pf => new { pf.PlanId, pf.FeatureId })
            .IsUnique();

        builder.Property(pf => pf.IsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(pf => pf.CreatedAt)
            .IsRequired();

        // Relationships
        builder.HasOne(pf => pf.Plan)
            .WithMany(p => p.PlanFeatures)
            .HasForeignKey(pf => pf.PlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pf => pf.Feature)
            .WithMany(f => f.PlanFeatures)
            .HasForeignKey(pf => pf.FeatureId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

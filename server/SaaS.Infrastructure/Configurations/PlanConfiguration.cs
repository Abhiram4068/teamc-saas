using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Configurations;

/// <summary>
/// Entity Framework Core configuration for the <see cref="Plan"/> entity.
/// </summary>
public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");

        builder.HasKey(p => p.Id);

        // Core Required Fields & Indexes
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.Code)
            .IsUnique();

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasDefaultValue(PlanStatus.Active);

        // Pricing & Precision
        builder.Property(p => p.MonthlyPrice)
            .HasPrecision(10, 2);

        builder.Property(p => p.YearlyPrice)
            .HasPrecision(10, 2);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasDefaultValue(PlanCurrency.INR);

        builder.Property(p => p.TrialPeriodDays)
            .IsRequired(false);

        // Audit & Lifecycle
        builder.Property(p => p.Version)
            .HasDefaultValue(1);

        builder.Property(p => p.CreatedBy)
            .HasMaxLength(100);

        builder.Property(p => p.CreatedAt)
            .IsRequired();
    }
}

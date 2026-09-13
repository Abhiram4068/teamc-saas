using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration
    : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.BillingCycle)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.Property(x => x.StripeCustomerId)
            .HasMaxLength(100);

        builder.Property(x => x.StripeSubscriptionId)
            .HasMaxLength(100);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        // Tenant → Subscription
        builder.HasOne(x => x.Tenant)
            .WithOne(x => x.Subscription)
            .HasForeignKey<Subscription>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Plan → Subscription
        builder.HasOne(x => x.Plan)
            .WithMany(x => x.Subscriptions)
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        // Stripe subscription should be unique
        builder.HasIndex(x => x.StripeSubscriptionId)
            .IsUnique();

        // One active subscription per tenant
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
    }
}
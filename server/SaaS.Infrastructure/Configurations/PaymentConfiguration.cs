using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration
    : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.StripeCheckoutSessionId)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.StripePaymentIntentId)
            .HasMaxLength(150);

        builder.Property(x => x.StripeInvoiceId)
            .HasMaxLength(150);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        // Tenant → Payments
        builder.HasOne(x => x.Tenant)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Subscription → Payments
        builder.HasOne(x => x.Subscription)
            .WithMany(x => x.Payments)
            .HasForeignKey(x => x.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);

        // User → Payments
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // A Stripe Checkout Session represents one checkout attempt
        builder.HasIndex(x => x.StripeCheckoutSessionId)
            .IsUnique();

        // Useful for Stripe reconciliation
        builder.HasIndex(x => x.StripePaymentIntentId);
        builder.HasIndex(x => x.StripeInvoiceId);
    }
}
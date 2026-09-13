using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }

    // Tenant that made the payment
    public long TenantId { get; set; }

    // Subscription this payment belongs to
    public Guid SubscriptionId { get; set; }

    // User who initiated the checkout
    public long UserId { get; set; }

    // Amount in INR
    public decimal Amount { get; set; }

    // Pending / Succeeded / Failed / Refunded
    public PaymentStatus Status { get; set; }

    // When the payment was completed
    public DateTime? PaymentDate { get; set; }

    // Stripe references
    public string StripeCheckoutSessionId { get; set; } = string.Empty;
    public string? StripePaymentIntentId { get; set; }
    public string? StripeInvoiceId { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Subscription Subscription { get; set; } = null!;
    public User User { get; set; } = null!;
}
using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Payment
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int SubscriptionId { get; set; }
    public Subscription Subscription { get; set; } = null!;

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string? TransactionId { get; set; }
    public string? PaymentProvider { get; set; }
    public string? ProviderEventId { get; set; }   // idempotency key for webhook retries

    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Subscription
{
    public Guid Id { get; set; }

    // Tenant that owns this subscription
    public long TenantId { get; set; }

    // Plan purchased by the tenant
    public int PlanId { get; set; }

    // Monthly / Yearly
    public BillingCycle BillingCycle { get; set; }

    // Current subscription period
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Pending / Active / PastDue / Cancelled / Expired
    public SubscriptionStatus Status { get; set; }

    // Stripe references
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Plan Plan { get; set; } = null!;

    public ICollection<Payment> Payments { get; set; }
        = new List<Payment>();
}
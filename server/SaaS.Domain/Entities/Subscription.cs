using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Subscription
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int PlanId { get; set; }
    public Plan Plan { get; set; } = null!;

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trialing;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime CurrentPeriodStart { get; set; } = DateTime.UtcNow;
    public DateTime CurrentPeriodEnd { get; set; }
    public bool AutoRenew { get; set; } = true;

    public byte[]? RowVersion { get; set; }

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
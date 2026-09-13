using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

/// <summary>
/// Represents a SaaS subscription plan tier.
/// </summary>
public class Plan
{
    public int Id { get; set; }

    // Display & Identification
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PlanStatus Status { get; set; } = PlanStatus.Active;

    // Pricing & Currency
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public PlanCurrency Currency { get; set; } = PlanCurrency.INR;
    public int? TrialPeriodDays { get; set; }

    // Versioning & Lifecycle
    public int Version { get; set; } = 1;
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }

    // Audit Logging
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public ICollection<PlanFeature> PlanFeatures { get; set; } = new List<PlanFeature>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
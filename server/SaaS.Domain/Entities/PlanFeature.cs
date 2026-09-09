namespace SaaS.Domain.Entities;

/// <summary>
/// Represents the assignment of a feature to a subscription plan.
/// </summary>
public class PlanFeature
{
    public int Id { get; set; }

    public int PlanId { get; set; }
    public Plan Plan { get; set; } = null!;

    public int FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;

    public bool IsEnabled { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
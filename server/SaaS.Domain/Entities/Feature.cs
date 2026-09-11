using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

/// <summary>
/// Represents a feature capability that can be assigned to SaaS plans.
/// </summary>
public class Feature
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public FeatureStatus Status { get; set; } = FeatureStatus.Active;

    // Audit Logging
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public ICollection<PlanFeature> PlanFeatures { get; set; } = new List<PlanFeature>();
}
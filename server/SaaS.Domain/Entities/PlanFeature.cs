namespace SaaS.Domain.Entities;

public class PlanFeature
{
    public int PlanId { get; set; }
    public Plan Plan { get; set; } = null!;

    public int FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
}
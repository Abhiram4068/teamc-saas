namespace SaaS.Domain.Entities;

public class PlanFeatureConfig
{
    public int Id { get; set; }
    
    public int PlanFeatureId { get; set; }
    public PlanFeature PlanFeature { get; set; } = null!;

    public bool? AccessValue { get; set; }
    public int? LimitValue { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

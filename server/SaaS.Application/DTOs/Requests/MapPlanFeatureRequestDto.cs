namespace SaaS.Application.DTOs.Requests;

public class PlanFeatureMappingDto
{
    public int FeatureId { get; set; }
    public bool? AccessValue { get; set; }
    public int? LimitValue { get; set; }
}

/// <summary>
/// Request DTO to map one plan to multiple features with their configurations.
/// </summary>
public class MapPlanFeatureRequestDto
{
    public int PlanId { get; set; }
    public List<PlanFeatureMappingDto> Features { get; set; } = new();
}

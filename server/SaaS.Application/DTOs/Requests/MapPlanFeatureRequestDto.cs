namespace SaaS.Application.DTOs.Requests;

/// <summary>
/// Request DTO to map one plan to multiple features.
/// </summary>
public class MapPlanFeatureRequestDto
{
    public int PlanId { get; set; }

    public List<int> FeatureIds { get; set; } = new();

    /// <summary>
    /// Alias to also accept "features" in JSON payloads without breaking.
    /// </summary>
    public List<int>? Features
    {
        get => FeatureIds;
        set
        {
            if (value != null && value.Count > 0)
                FeatureIds = value;
        }
    }
}

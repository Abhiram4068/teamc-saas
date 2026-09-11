namespace SaaS.Application.DTOs.Response;

public class PlanFeatureResponseDto
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string PlanCode { get; set; } = string.Empty;
    public int FeatureId { get; set; }
    public string FeatureName { get; set; } = string.Empty;
    public string FeatureCode { get; set; } = string.Empty;
    public string? FeatureDescription { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalFeatures { get; set; }
}

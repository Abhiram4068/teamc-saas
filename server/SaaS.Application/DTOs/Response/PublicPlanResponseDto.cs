using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class PublicPlanResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public PlanCurrency Currency { get; set; }
    public int? TrialPeriodDays { get; set; }
    public List<PublicPlanFeatureDto> Features { get; set; } = new();
}

public class PublicPlanFeatureDto
{
    public int Id { get; set; }
    public int FeatureId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; }
}

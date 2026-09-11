using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class CreatePlanRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PlanStatus Status { get; set; }
    
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public PlanCurrency Currency { get; set; } = PlanCurrency.INR;
    public int? TrialPeriodDays { get; set; }
    
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }
}

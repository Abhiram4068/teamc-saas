using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class PlanResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PlanStatus Status { get; set; }

    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public PlanCurrency Currency { get; set; }
    public int? TrialPeriodDays { get; set; }

    public int Version { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

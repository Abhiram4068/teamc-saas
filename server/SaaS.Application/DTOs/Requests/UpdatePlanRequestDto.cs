namespace SaaS.Application.DTOs.Requests;

public class UpdatePlanRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Rank { get; set; }
    public int? TrialPeriodDays { get; set; }
}

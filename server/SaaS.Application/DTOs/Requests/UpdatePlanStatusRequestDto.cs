using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class UpdatePlanStatusRequestDto
{
    public PlanStatus Status { get; set; }
}

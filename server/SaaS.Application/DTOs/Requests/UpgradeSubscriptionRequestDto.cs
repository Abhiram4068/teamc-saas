using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class UpgradeSubscriptionRequestDto
{
    public int PlanId { get; set; }
    public BillingCycle BillingCycle { get; set; }
}

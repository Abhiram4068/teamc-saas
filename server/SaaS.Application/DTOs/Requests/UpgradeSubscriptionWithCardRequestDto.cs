using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class UpgradeSubscriptionWithCardRequestDto
{
    public int PlanId { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public string PaymentMethodId { get; set; } = string.Empty;
}

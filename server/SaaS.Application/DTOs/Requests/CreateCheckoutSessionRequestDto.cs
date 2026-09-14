using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class CreateCheckoutSessionRequestDto
{
    public Guid PlanId { get; set; }

    public BillingCycle BillingCycle { get; set; }
}
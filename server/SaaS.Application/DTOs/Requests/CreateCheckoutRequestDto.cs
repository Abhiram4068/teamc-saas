using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class CreateCheckoutRequestDto
{
    public int PlanId { get; set; }

    public BillingCycle BillingCycle { get; set; }
}
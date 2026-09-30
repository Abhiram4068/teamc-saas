using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class CreateCheckoutRequestDto
{
    public int PlanId { get; set; }

    public BillingCycle BillingCycle { get; set; }

    public string OrganizationName { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Pincode { get; set; } = string.Empty;
}
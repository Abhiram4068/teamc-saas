using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class CreateCheckoutRequestDto
{
    public int PlanId { get; set; }

    public BillingCycle BillingCycle { get; set; }

    public string OrganizationName { get; set; } = string.Empty;

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? Pincode { get; set; }
}
using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class SubscriptionResponseDto
{
    public bool HasActiveSubscription { get; set; }
    public Guid Id { get; set; }
    public int PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public SubscriptionStatus Status { get; set; }
    public DateTime SubscribedOn { get; set; }
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public decimal PlanPrice { get; set; }
    
    // Billing Information
    public string OrganizationName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
}

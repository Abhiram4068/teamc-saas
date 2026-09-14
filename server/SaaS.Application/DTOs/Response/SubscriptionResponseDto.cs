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
    public DateTime CurrentPeriodEnd { get; set; }
}

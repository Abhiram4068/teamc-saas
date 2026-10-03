using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface ISubscriptionService
{
    Task<ApiResponse<CheckoutResponseDto>> CreateCheckoutSessionAsync(
        CreateCheckoutRequestDto request,
        int userId,
        int tenantId);

    Task<ApiResponse<SubscriptionResponseDto>> GetCurrentSubscriptionAsync(int tenantId);
    Task<ApiResponse<SubscriptionResponseDto>> GetScheduledSubscriptionAsync(int tenantId);

    Task<ApiResponse<string>> CompleteCheckoutAsync(string sessionId, string customerId, string subscriptionId, string? invoiceId);

    Task<ApiResponse<object>> CancelScheduledSubscriptionAsync(Guid subscriptionId, int tenantId);
    Task<ApiResponse<string>> CancelSubscriptionAsync(int tenantId);
    
    Task HandleRefundUpdatedAsync(string paymentIntentId, string status);
    Task HandleSubscriptionCanceledAsync(string subscriptionId);

    Task<ApiResponse<IEnumerable<PlanFeatureResponseDto>>> GetMyPlanFeaturesAsync(int tenantId);
    
    Task<ApiResponse<string>> UpgradeSubscriptionImmediatelyAsync(int tenantId, int planId, SaaS.Domain.Enums.BillingCycle billingCycle);
}
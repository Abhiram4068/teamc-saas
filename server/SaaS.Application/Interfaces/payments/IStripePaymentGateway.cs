using SaaS.Application.DTOs.Payements;

namespace SaaS.Application.Interfaces.Payment;

/// <summary>
/// Interface for creating the checkout session that the stripe would be sending back to te server that the server would send the client app
/// </summary>
public interface IStripePaymentGateway
{
    Task<StripeCheckoutResult> CreateCheckoutSessionAsync(
        int tenantId,
        int userId,
        string stripePriceId);

    Task<bool> CancelSubscriptionAsync(string stripeSubscriptionId);
    
    Task<string?> RefundPaymentAsync(string paymentIntentId);
    
    Task<string?> GetLatestPaymentIntentIdForCustomerAsync(string customerId);
    
    Task<bool> UpgradeSubscriptionImmediatelyAsync(string stripeSubscriptionId, string newStripePriceId);
    
    Task<bool> ScheduleSubscriptionUpgradeAsync(string stripeSubscriptionId, string newStripePriceId);
    
    Task<decimal> PreviewUpgradeProrationAsync(string stripeCustomerId, string stripeSubscriptionId, string newStripePriceId);
}
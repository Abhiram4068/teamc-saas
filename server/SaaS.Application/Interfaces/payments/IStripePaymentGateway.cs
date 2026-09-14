using SaaS.Application.DTOs.Payements;

namespace SaaS.Application.Interfaces.Payment;

public interface IStripePaymentGateway
{
    Task<StripeCheckoutResult> CreateCheckoutSessionAsync(
        int tenantId,
        int userId,
        string stripePriceId);
}
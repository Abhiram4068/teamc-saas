using SaaS.Application.DTOs.Payements;
using SaaS.Application.Interfaces.Payment;
using SaaS.Application.Interfaces.Payments;
using Stripe.Checkout;

namespace SaaS.Infrastructure.Payments.Stripe;

/// <summary>
/// Create a checkout session for Stripe payment gateway.
/// </summary>
public class StripePaymentGateway : IStripePaymentGateway
{
    private readonly StripeOptions _stripeOptions;

    public StripePaymentGateway(Microsoft.Extensions.Options.IOptions<StripeOptions> stripeOptions)
    {
        _stripeOptions = stripeOptions.Value;
    }

    public async Task<StripeCheckoutResult> CreateCheckoutSessionAsync(
        int tenantId,
        int userId,
        string stripePriceId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration! Please verify it is in User Secrets as 'Stripe:SecretKey'.");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        var options = new SessionCreateOptions
        {
            Mode = "subscription",

            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Price = stripePriceId,
                    Quantity = 1
                }
            },

            SuccessUrl = $"{_stripeOptions.FrontendUrl}/payment/success",
            CancelUrl = $"{_stripeOptions.FrontendUrl}/payment/cancel",

            ClientReferenceId = tenantId.ToString(),

            Metadata = new Dictionary<string, string>
            {
                { "TenantId", tenantId.ToString() },
                { "UserId", userId.ToString() }
            }
        };

        // This comes from the official Stripe.NET package
        var service = new SessionService();

        // This line sends the HTTP POST request to Stripe's servers
        var session = await service.CreateAsync(options);

        return new StripeCheckoutResult
        {
            SessionId = session.Id,
            CheckoutUrl = session.Url
        };
    }
}
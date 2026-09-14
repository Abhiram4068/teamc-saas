namespace SaaS.Infrastructure.Payments.Stripe;

public class StripeOptions
{
    public string SecretKey { get; set; } = string.Empty;

    public string WebhookSecret { get; set; } = string.Empty;

    public string FrontendUrl { get; set; } = string.Empty;
}
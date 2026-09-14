namespace SaaS.Application.DTOs.Payements;

public class StripeCheckoutResult
{
    public string SessionId { get; set; } = string.Empty;

    public string CheckoutUrl { get; set; } = string.Empty;
}
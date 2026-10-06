using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SaaS.Application.Interfaces.Service;
using SaaS.Infrastructure.Payments.Stripe;
using Stripe;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhooksController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly StripeOptions _stripeOptions;
    private readonly ILogger<WebhooksController> _logger;

    public WebhooksController(
        ISubscriptionService subscriptionService,
        IOptions<StripeOptions> stripeOptions,
        ILogger<WebhooksController> logger)
    {
        _subscriptionService = subscriptionService;
        _stripeOptions = stripeOptions.Value;
        _logger = logger;
    }

    [HttpPost("stripe")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
         
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _stripeOptions.WebhookSecret
            );

            // Handle the checkout.session.completed event
            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as global::Stripe.Checkout.Session;
                if (session != null)
                {
                    _logger.LogInformation("Processing successful checkout session: {SessionId}", session.Id);
                    
                    var result = await _subscriptionService.CompleteCheckoutAsync(
                        session.Id, 
                        session.CustomerId, 
                        session.SubscriptionId,
                        session.InvoiceId);
                    
                    if (result.Success)
                    {
                        _logger.LogInformation("Successfully completed checkout for session: {SessionId}", session.Id);
                    }
                    else
                    {
                        _logger.LogError("Failed to complete checkout for session {SessionId}: {Message}", session.Id, result.Message);
                    }
                }
            }
            else if (stripeEvent.Type == "customer.subscription.deleted")
            {
                var subscription = stripeEvent.Data.Object as global::Stripe.Subscription;
                if (subscription != null)
                {
                    _logger.LogInformation("Processing canceled subscription: {SubscriptionId}", subscription.Id);
                    await _subscriptionService.HandleSubscriptionCanceledAsync(subscription.Id);
                }
            }
            else if (stripeEvent.Type == "refund.created" || stripeEvent.Type == "refund.updated" || stripeEvent.Type == "refund.failed")
            {
                var refund = stripeEvent.Data.Object as global::Stripe.Refund;
                
                // We now save the Payment Intent ID (pi_...) in the DB, so we should look for that!
                var transactionId = refund?.PaymentIntentId;

                if (refund != null && !string.IsNullOrEmpty(transactionId))
                {
                    _logger.LogInformation("Processing refund {RefundId} for Transaction {TransactionId} with status {Status}", refund.Id, transactionId, refund.Status);
                    await _subscriptionService.HandleRefundUpdatedAsync(transactionId, refund.Status);
                }
            }
            else
            {
                _logger.LogInformation("Unhandled Stripe event type: {EventType}", stripeEvent.Type);
            }

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe Webhook Error");
            return BadRequest(new { error = e.Message });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Internal error processing Stripe Webhook");
            return StatusCode(500, new { error = "Internal Server Error" });
        }
    }
}

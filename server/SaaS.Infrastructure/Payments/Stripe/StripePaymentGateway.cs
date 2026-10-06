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

    public async Task<bool> CancelSubscriptionAsync(string stripeSubscriptionId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration!");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        var service = new global::Stripe.SubscriptionService();
        var subscription = await service.CancelAsync(stripeSubscriptionId);
        return subscription.Status == "canceled";
    }

    public async Task<string?> RefundPaymentAsync(string transactionId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration!");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        var options = new global::Stripe.RefundCreateOptions();
        
        if (transactionId.StartsWith("ch_"))
        {
            options.Charge = transactionId;
        }
        else
        {
            options.PaymentIntent = transactionId;
        }

        var service = new global::Stripe.RefundService();
        var refund = await service.CreateAsync(options);

        return refund.Id;
    }

    public async Task<string?> GetLatestPaymentIntentIdForCustomerAsync(string customerId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration!");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        try
        {
            // Fetch the most recent charge for this customer
            var chargeService = new global::Stripe.ChargeService();
            var charges = await chargeService.ListAsync(new global::Stripe.ChargeListOptions 
            { 
                Customer = customerId,
                Limit = 1
            });
            
            var latestCharge = charges.Data.FirstOrDefault();
            
            // Return the Payment Intent ID (pi_...)
            return latestCharge?.PaymentIntentId;
        }
        catch
        {
            return null;
        }
    }

    public async Task<bool> UpgradeSubscriptionImmediatelyAsync(string stripeSubscriptionId, string newStripePriceId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration!");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        var service = new global::Stripe.SubscriptionService();

        // Fetch the user's current subscription from Stripe.
        var subscription = await service.GetAsync(stripeSubscriptionId);
        
        // Terminate if the subscription does not exist or has no active items.
        if (subscription == null || subscription.Items.Data.Count == 0)
        {
            return false;
        }

        // Prepare the configuration to modify the subscription plan.
        var options = new global::Stripe.SubscriptionUpdateOptions
        {
            Items = new List<global::Stripe.SubscriptionItemOptions>
            {
                new global::Stripe.SubscriptionItemOptions
                {
                    // Target the existing subscription item to be updated.
                    Id = subscription.Items.Data[0].Id,
                    // Provide the Price ID for the new plan.
                    Price = newStripePriceId,
                }
            },
            // Instruct Stripe to immediately calculate prorations, generate an invoice, and process the charge.
            ProrationBehavior = "always_invoice"
        };

        // Submit the update request to Stripe.
        var updatedSubscription = await service.UpdateAsync(stripeSubscriptionId, options);
        
        // Return true if the updated subscription status is active.
        return updatedSubscription.Status == "active";
    }

    public async Task<bool> ScheduleSubscriptionUpgradeAsync(string stripeSubscriptionId, string newStripePriceId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration!");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        var subService = new global::Stripe.SubscriptionService();
        var subscription = await subService.GetAsync(stripeSubscriptionId);

        if (subscription == null || subscription.Items.Data.Count == 0) return false;

        var scheduleService = new global::Stripe.SubscriptionScheduleService();
        global::Stripe.SubscriptionSchedule schedule;
        
        if (!string.IsNullOrEmpty(subscription.ScheduleId))
        {
            // 1a. It already has a schedule, get it
            schedule = await scheduleService.GetAsync(subscription.ScheduleId);
        }
        else
        {
            // 1b. Create a new schedule attached to the existing subscription
            var createOptions = new global::Stripe.SubscriptionScheduleCreateOptions
            {
                FromSubscription = stripeSubscriptionId
            };
            schedule = await scheduleService.CreateAsync(createOptions);
        }

        // 2. Modify the schedule to have two phases
        var updateOptions = new global::Stripe.SubscriptionScheduleUpdateOptions
        {
            Phases = new List<global::Stripe.SubscriptionSchedulePhaseOptions>
            {
                // Phase 1: Keep the current plan until the current billing period ends
                new global::Stripe.SubscriptionSchedulePhaseOptions
                {
                    StartDate = schedule.CurrentPhase.StartDate,
                    EndDate = schedule.CurrentPhase.EndDate,
                    Items = new List<global::Stripe.SubscriptionSchedulePhaseItemOptions>
                    {
                        new global::Stripe.SubscriptionSchedulePhaseItemOptions
                        {
                            Price = subscription.Items.Data[0].Price.Id,
                            Quantity = 1
                        }
                    }
                },
                // Phase 2: Start the new plan immediately after the current billing period ends
                new global::Stripe.SubscriptionSchedulePhaseOptions
                {
                    Items = new List<global::Stripe.SubscriptionSchedulePhaseItemOptions>
                    {
                        new global::Stripe.SubscriptionSchedulePhaseItemOptions
                        {
                            Price = newStripePriceId,
                            Quantity = 1
                        }
                    }
                }
            }
        };

        var updatedSchedule = await scheduleService.UpdateAsync(schedule.Id, updateOptions);
        return updatedSchedule.Status == "active";
    }

    public async Task<decimal> PreviewUpgradeProrationAsync(string stripeCustomerId, string stripeSubscriptionId, string newStripePriceId)
    {
        if (string.IsNullOrEmpty(_stripeOptions.SecretKey))
        {
            throw new InvalidOperationException("Stripe SecretKey is missing from configuration!");
        }
        
        global::Stripe.StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        var subService = new global::Stripe.SubscriptionService();
        var subscription = await subService.GetAsync(stripeSubscriptionId);

        if (subscription == null || subscription.Items.Data.Count == 0) return 0;

        var options = new global::Stripe.InvoiceCreatePreviewOptions
        {
            // Providing stripe with the customer id and current subscription
            Customer = stripeCustomerId,
            Subscription = stripeSubscriptionId,
            SubscriptionDetails = new global::Stripe.InvoiceSubscriptionDetailsOptions
            {
                Items = new List<global::Stripe.InvoiceSubscriptionDetailsItemOptions>
                {
                    new global::Stripe.InvoiceSubscriptionDetailsItemOptions
                    {
                        Id = subscription.Items.Data[0].Id,
                        Price = newStripePriceId,
                    }
                }
            }
        };

        // Calculate the prorated invoice
        var invoiceService = new global::Stripe.InvoiceService();
        var upcomingInvoice = await invoiceService.CreatePreviewAsync(options);

        // AmountDue is in the smallest currency unit (e.g. cents/paise)
        return (decimal)upcomingInvoice.AmountDue / 100m;
    }
}
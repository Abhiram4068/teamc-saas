using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Payment;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly IPlanRepository _planRepository;
    private readonly IStripePaymentGateway _stripePaymentGateway;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPlanFeatureRepository _planFeatureRepository;

    public SubscriptionService(
        IPlanRepository planRepository,
        IStripePaymentGateway stripePaymentGateway,
        ISubscriptionRepository subscriptionRepository,
        IPaymentRepository paymentRepository,
        IUserRepository userRepository,
        IPlanFeatureRepository planFeatureRepository)
    {
        _planRepository = planRepository;
        _stripePaymentGateway = stripePaymentGateway;
        _subscriptionRepository = subscriptionRepository;
        _paymentRepository = paymentRepository;
        _userRepository = userRepository;
        _planFeatureRepository = planFeatureRepository;
    }

    public async Task<ApiResponse<CheckoutResponseDto>> CreateCheckoutSessionAsync(
        CreateCheckoutRequestDto request,
        int userId,
        int tenantId)
    {
        //  Get the selected plan
        var plan = await _planRepository.GetByIdAsync(request.PlanId);

        if (plan == null)
        {
            return ApiResponse<CheckoutResponseDto>.FailureResponse(
                "Plan not found.");
        }

        // Make sure the plan is active
        if (plan.Status != PlanStatus.Active)
        {
            return ApiResponse<CheckoutResponseDto>.FailureResponse(
                "Selected plan is not active.");
        }


        // Select the correct Stripe Price ID for the billing cycle
        string? stripePriceId = request.BillingCycle switch
        {
            BillingCycle.Monthly => plan.StripeMonthlyPriceId,

            BillingCycle.Yearly => plan.StripeYearlyPriceId,

            _ => null
        };

        // Make sure Stripe Price ID exists
        if (string.IsNullOrWhiteSpace(stripePriceId))
        {
            return ApiResponse<CheckoutResponseDto>.FailureResponse(
                "Stripe price is not configured for this plan.");
        }

        // Check if there is already a scheduled subscription
        var scheduledSubscription = await _subscriptionRepository.GetScheduledByTenantIdAsync(tenantId);
        if (scheduledSubscription != null)
        {
            return ApiResponse<CheckoutResponseDto>.FailureResponse(
                "You already have a scheduled plan change. Please wait for it to take effect or contact support.");
        }

        // Cleanup any stale/abandoned Pending subscriptions and their payments
        var pendingSubscriptions = await _subscriptionRepository.GetPendingSubscriptionsByTenantIdAsync(tenantId);
        var tenantPayments = await _paymentRepository.GetByTenantIdAsync(tenantId);
        
        foreach (var pendingSub in pendingSubscriptions)
        {
            var orphanedPayments = tenantPayments.Where(p => p.SubscriptionId == pendingSub.Id);
            foreach (var orphanedPayment in orphanedPayments)
            {
                await _paymentRepository.DeleteAsync(orphanedPayment);
            }
            await _subscriptionRepository.DeleteAsync(pendingSub);
        }

        // Get explicit Active subscription to chain off of
        var subscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        
        if (subscription == null)
        {
            subscription = new Subscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PlanId = plan.Id,
                BillingCycle = request.BillingCycle,
                StartDate = DateTime.UtcNow,
                EndDate = request.BillingCycle == BillingCycle.Monthly 
                    ? DateTime.UtcNow.AddMonths(1) 
                    : DateTime.UtcNow.AddYears(1),
                Status = SubscriptionStatus.Pending,
                OrganizationName = request.OrganizationName,
                Address = request.Address,
                City = request.City,
                State = request.State,
                Pincode = request.Pincode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _subscriptionRepository.AddAsync(subscription);
        }
        else
        {
            // Instead of mutating the active subscription, we create a new scheduled one
            bool isCurrentPlanFree = subscription.Plan?.MonthlyPrice == 0 || subscription.Plan?.Name.ToLower().Contains("free") == true;
            var startDate = isCurrentPlanFree ? DateTime.UtcNow : (subscription.EndDate ?? DateTime.UtcNow);
            
            var newSubscription = new Subscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PlanId = plan.Id,
                BillingCycle = request.BillingCycle,
                StartDate = startDate,
                EndDate = request.BillingCycle == BillingCycle.Monthly 
                    ? startDate.AddMonths(1) 
                    : startDate.AddYears(1),
                Status = SubscriptionStatus.Pending,
                OrganizationName = request.OrganizationName,
                Address = request.Address,
                City = request.City,
                State = request.State,
                Pincode = request.Pincode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _subscriptionRepository.AddAsync(newSubscription);

            // Point 'subscription' to the new one so the Payment record links to it
            subscription = newSubscription;
        }

        // Create Stripe Checkout Session ONLY after all local validation has passed
        var checkoutResult =
            await _stripePaymentGateway.CreateCheckoutSessionAsync(
                tenantId,
                userId,
                stripePriceId);

        // Create Pending Payment with that session id returned from stripe
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            SubscriptionId = subscription.Id,
            UserId = userId,
            Amount = request.BillingCycle == BillingCycle.Monthly ? plan.MonthlyPrice : plan.YearlyPrice,
            Status = PaymentStatus.Pending,
            StripeCheckoutSessionId = checkoutResult.SessionId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _paymentRepository.AddAsync(payment);

        // Save changes to DB in one transaction (implicitly handled by SaveChangesAsync)
        await _subscriptionRepository.SaveChangesAsync();

        // Return checkok out details
        var response = new CheckoutResponseDto
        {
            SessionId = checkoutResult.SessionId,
            CheckoutUrl = checkoutResult.CheckoutUrl //checkout url that the user gets redirected to in frontend
        };

        return ApiResponse<CheckoutResponseDto>.SuccessResponse(response);
    }

    public async Task<ApiResponse<string>> CompleteCheckoutAsync(string sessionId, string customerId, string subscriptionId, string? invoiceId)
    {
        var payment = await _paymentRepository.GetByStripeSessionIdAsync(sessionId);
        
        if (payment == null)
        {
            return ApiResponse<string>.FailureResponse("Payment not found for session.");
        }

        var subscription = await _subscriptionRepository.GetByIdAsync(payment.SubscriptionId);
        
        if (subscription == null)
        {
            return ApiResponse<string>.FailureResponse("Subscription not found.");
        }
        
        if (!string.IsNullOrEmpty(customerId))
        {
            // Makes an HTTP Api call directly to the stripes servers to get the latest charge id.
            var paymentIntentId = await _stripePaymentGateway.GetLatestPaymentIntentIdForCustomerAsync(customerId);
            if (!string.IsNullOrEmpty(paymentIntentId))
            {
                payment.StripePaymentIntentId = paymentIntentId;
                payment.StripeInvoiceId = invoiceId;
            }
        }

        // Update Payment
        payment.Status = PaymentStatus.Succeeded;
        payment.PaymentDate = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(payment);

        var activeSubscription = await _subscriptionRepository.GetActiveByTenantIdAsync((int)payment.TenantId);
        if (activeSubscription != null && activeSubscription.Id != subscription.Id)
        {
            bool isCurrentPlanFree = activeSubscription.Plan?.MonthlyPrice == 0 || activeSubscription.Plan?.Name.ToLower().Contains("free") == true;
            if (isCurrentPlanFree)
            {
                activeSubscription.Status = SubscriptionStatus.Expired;
                activeSubscription.EndDate = DateTime.UtcNow;
                activeSubscription.UpdatedAt = DateTime.UtcNow;
                await _subscriptionRepository.UpdateAsync(activeSubscription);
            }
        }

        // Update Subscription
        // If it starts in the future, it should be Scheduled. If it starts now, it's Active.
        subscription.Status = subscription.StartDate > DateTime.UtcNow 
            ? SubscriptionStatus.Scheduled 
            : SubscriptionStatus.Active;
            
        subscription.StripeCustomerId = customerId;
        subscription.StripeSubscriptionId = subscriptionId;
        subscription.UpdatedAt = DateTime.UtcNow;
        await _subscriptionRepository.UpdateAsync(subscription);

        await _subscriptionRepository.SaveChangesAsync();

        return ApiResponse<string>.SuccessResponse("Payment completed successfully.");
    }

    public async Task<ApiResponse<SubscriptionResponseDto>> GetCurrentSubscriptionAsync(int tenantId)
    {
        var subscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        var scheduledSubscription = await _subscriptionRepository.GetScheduledByTenantIdAsync(tenantId);
        bool hasScheduled = scheduledSubscription != null;
        
        if (subscription == null)
        {
            return ApiResponse<SubscriptionResponseDto>.SuccessResponse(new SubscriptionResponseDto 
            { 
                HasActiveSubscription = false,
                HasScheduledSubscription = hasScheduled
            }, "No active subscription found.");
        }

        var dto = new SubscriptionResponseDto
        {
            HasActiveSubscription = true,
            HasScheduledSubscription = hasScheduled,
            Id = subscription.Id,
            PlanId = subscription.PlanId,
            PlanName = subscription.Plan?.Name ?? "Unknown Plan",
            Status = subscription.Status,
            SubscribedOn = subscription.CreatedAt,
            CurrentPeriodStart = subscription.StartDate,
            CurrentPeriodEnd = subscription.EndDate,
            BillingCycle = subscription.BillingCycle,
            PlanPrice = subscription.BillingCycle == BillingCycle.Monthly 
                ? (subscription.Plan?.MonthlyPrice ?? 0) 
                : (subscription.Plan?.YearlyPrice ?? 0),
            OrganizationName = subscription.OrganizationName,
            Address = subscription.Address,
            City = subscription.City,
            State = subscription.State,
            Pincode = subscription.Pincode
        };

        return ApiResponse<SubscriptionResponseDto>.SuccessResponse(dto);
    }

    public async Task<ApiResponse<SubscriptionResponseDto>> GetScheduledSubscriptionAsync(int tenantId)
    {
        var scheduledSubscription = await _subscriptionRepository.GetScheduledByTenantIdAsync(tenantId);
        
        if (scheduledSubscription == null)
        {
            return ApiResponse<SubscriptionResponseDto>.SuccessResponse(new SubscriptionResponseDto 
            { 
                HasScheduledSubscription = false
            }, "No scheduled subscription found.");
        }

        var payment = await _paymentRepository.GetBySubscriptionIdAsync(scheduledSubscription.Id);

        var dto = new SubscriptionResponseDto
        {
            HasScheduledSubscription = true,
            Id = scheduledSubscription.Id,
            PlanId = scheduledSubscription.PlanId,
            PlanName = scheduledSubscription.Plan?.Name ?? "Unknown Plan",
            Status = scheduledSubscription.Status,
            SubscribedOn = scheduledSubscription.CreatedAt,
            CurrentPeriodStart = scheduledSubscription.StartDate,
            CurrentPeriodEnd = scheduledSubscription.EndDate,
            BillingCycle = scheduledSubscription.BillingCycle,
            PlanPrice = scheduledSubscription.BillingCycle == BillingCycle.Monthly 
                ? (scheduledSubscription.Plan?.MonthlyPrice ?? 0) 
                : (scheduledSubscription.Plan?.YearlyPrice ?? 0),
            OrganizationName = scheduledSubscription.OrganizationName,
            Address = scheduledSubscription.Address,
            City = scheduledSubscription.City,
            State = scheduledSubscription.State,
            Pincode = scheduledSubscription.Pincode,
            PaymentStatus = payment?.Status.ToString(),
            PaymentDate = payment?.PaymentDate,
            AmountPaid = payment?.Amount
        };

        return ApiResponse<SubscriptionResponseDto>.SuccessResponse(dto);
    }

    public async Task<ApiResponse<IEnumerable<PlanFeatureResponseDto>>> GetMyPlanFeaturesAsync(int tenantId)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId);
        
        if (subscription == null)
        {
            return ApiResponse<IEnumerable<PlanFeatureResponseDto>>.FailureResponse("No active subscription found.");
        }

        var planFeatures = await _planFeatureRepository.GetByPlanIdAsync(subscription.PlanId);

        var dto = planFeatures.Select(pf => new PlanFeatureResponseDto
        {
            Id = pf.Id,
            PlanId = pf.PlanId,
            PlanName = pf.Plan?.Name ?? string.Empty,
            PlanCode = pf.Plan?.Code ?? string.Empty,
            FeatureId = pf.FeatureId,
            FeatureName = pf.Feature?.Name ?? string.Empty,
            FeatureCode = pf.Feature?.Code ?? string.Empty,
            FeatureDescription = pf.Feature?.Description,
            IsEnabled = pf.IsEnabled,
            CreatedAt = pf.CreatedAt
        }).ToList();

        return ApiResponse<IEnumerable<PlanFeatureResponseDto>>.SuccessResponse(dto);
    }

    public async Task<ApiResponse<string>> CancelSubscriptionAsync(int tenantId)
    {
        var subscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        if (subscription == null)
        {
            return ApiResponse<string>.FailureResponse("No active subscription found.");
        }

        if (subscription.Plan?.Code == "FREE_PLAN")
        {
            return ApiResponse<string>.FailureResponse("You cannot cancel a free plan.");
        }

        if (!string.IsNullOrEmpty(subscription.StripeSubscriptionId))
        {
            try
            {
                var canceled = await _stripePaymentGateway.CancelSubscriptionAsync(subscription.StripeSubscriptionId);
                if (!canceled)
                {
                    return ApiResponse<string>.FailureResponse("Failed to cancel subscription with the payment gateway.");
                }
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.FailureResponse($"Error communicating with payment gateway: {ex.Message}");
            }
        }

        var freePlan = await _planRepository.GetByCodeAsync("FREE_PLAN");
        if (freePlan == null)
        {
            return ApiResponse<string>.FailureResponse("System error: Free plan is not configured.");
        }

        // Mark existing subscription as canceled
        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.EndDate = DateTime.UtcNow;
        subscription.UpdatedAt = DateTime.UtcNow;
        
        await _subscriptionRepository.UpdateAsync(subscription);

        // Create a brand new subscription for the Free Plan
        var newFreeSubscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = freePlan.Id,
            Status = SubscriptionStatus.Active,
            BillingCycle = BillingCycle.Monthly, 
            StartDate = DateTime.UtcNow,
            EndDate = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            
            // Carry over billing info
            OrganizationName = subscription.OrganizationName,
            Address = subscription.Address,
            City = subscription.City,
            State = subscription.State,
            Pincode = subscription.Pincode
        };

        await _subscriptionRepository.AddAsync(newFreeSubscription);
        await _subscriptionRepository.SaveChangesAsync();

        return ApiResponse<string>.SuccessResponse("Subscription canceled and successfully reverted to the Free Plan.", "Success");
    }

    public async Task<ApiResponse<object>> CancelScheduledSubscriptionAsync(Guid subscriptionId, int tenantId)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(subscriptionId);
        if (subscription == null)
        {
            return ApiResponse<object>.FailureResponse("Subscription not found.");
        }

        if (subscription.TenantId != tenantId)
        {
            return ApiResponse<object>.FailureResponse("Unauthorized access to subscription.");
        }

        if (subscription.Status != SubscriptionStatus.Scheduled)
        {
            return ApiResponse<object>.FailureResponse("Only scheduled subscriptions can be cancelled for a refund.");
        }

        var payment = await _paymentRepository.GetBySubscriptionIdAsync(subscriptionId);
        if (payment == null || payment.Status != PaymentStatus.Succeeded)
        {
            return ApiResponse<object>.FailureResponse("Payment record not found for this scheduled subscription.");
        }

        if (string.IsNullOrEmpty(subscription.StripeSubscriptionId))
        {
            return ApiResponse<object>.FailureResponse("Stripe subscription ID is missing.");
        }

        // Use the Payment Intent ID we already stored in the DB during checkout
        string? transactionId = payment.StripePaymentIntentId;

        if (string.IsNullOrEmpty(transactionId))
        {
            return ApiResponse<object>.FailureResponse("Stripe Payment Intent / Charge ID is missing and could not be found. Cannot process refund.");
        }

        try
        {
            var canceled = await _stripePaymentGateway.CancelSubscriptionAsync(subscription.StripeSubscriptionId);
            if (!canceled)
            {
                return ApiResponse<object>.FailureResponse("Failed to cancel scheduled subscription with Stripe.");
            }
            
            // Added retry login just in case if the refund id was not issued due to some network issues
            int maxRetries = 3;
            string? refundId = null;
            
            for (int i = 0; i < maxRetries; i++)
            {
                refundId = await _stripePaymentGateway.RefundPaymentAsync(transactionId);
                
                if (!string.IsNullOrEmpty(refundId))
                {
                    break; // Break out of the retry loop if success
                }
                
                // If it failed, wait before retrying (exponential backoff: 1s, 2s, 3s)
                if (i < maxRetries - 1)
                {
                    await Task.Delay(1000 * (i + 1));
                }
            }
            
            if (string.IsNullOrEmpty(refundId))
            {
                subscription.Status = SubscriptionStatus.Cancelled;
                subscription.EndDate = DateTime.UtcNow;
                subscription.UpdatedAt = DateTime.UtcNow;
                await _subscriptionRepository.UpdateAsync(subscription);
                
                payment.Status = PaymentStatus.RefundFailed;
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentRepository.UpdateAsync(payment);
                
                await _subscriptionRepository.SaveChangesAsync();
                
                return ApiResponse<object>.FailureResponse("Subscription cancelled, but refund request failed.");
            }
            
            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.EndDate = DateTime.UtcNow; 
            subscription.UpdatedAt = DateTime.UtcNow;
            await _subscriptionRepository.UpdateAsync(subscription);
            
            payment.Status = PaymentStatus.RefundPending;
            payment.UpdatedAt = DateTime.UtcNow;
            await _paymentRepository.UpdateAsync(payment);
            
            await _subscriptionRepository.SaveChangesAsync();
            
            return ApiResponse<object>.SuccessResponse(new 
            {
                Message = "Subscription cancellation initiated.",
                SubscriptionStatus = "Cancelled",
                PaymentStatus = "RefundPending",
                RefundId = refundId
            }, "Accepted");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.FailureResponse($"Error during cancellation and refund: {ex.Message}");
        }
    }

    public async Task HandleRefundUpdatedAsync(string paymentIntentId, string status)
    {
        var payment = await _paymentRepository.GetByStripePaymentIntentIdAsync(paymentIntentId);
        if (payment != null)
        {
            if (status == "succeeded")
            {
                payment.Status = PaymentStatus.Refunded;
            }
            else if (status == "failed" || status == "canceled")
            {
                payment.Status = PaymentStatus.RefundFailed;
            }
            payment.UpdatedAt = DateTime.UtcNow;
            await _paymentRepository.UpdateAsync(payment);
            await _paymentRepository.SaveChangesAsync();
        }
    }

    public async Task HandleSubscriptionCanceledAsync(string stripeSubscriptionId)
    {
        var subscription = await _subscriptionRepository.GetByStripeSubscriptionIdAsync(stripeSubscriptionId);
        if (subscription != null)
        {
            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.EndDate = DateTime.UtcNow;
            subscription.UpdatedAt = DateTime.UtcNow;
            await _subscriptionRepository.UpdateAsync(subscription);
            await _subscriptionRepository.SaveChangesAsync();
        }
    }
    


    /// <summary>
    /// Schedules a subscription upgrade to take effect at the end of the current billing cycle.
    /// Creates a scheduled subscription record in the database.
    /// </summary>
    public async Task<ApiResponse<string>> ScheduleSubscriptionUpgradeAsync(int tenantId, int planId, BillingCycle billingCycle)
    {
        var activeSubscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        if (activeSubscription == null || string.IsNullOrEmpty(activeSubscription.StripeSubscriptionId))
        {
            return ApiResponse<string>.FailureResponse("You dont have an active Stripe subscription to upgrade.");
        }

        var newPlan = await _planRepository.GetByIdAsync(planId);
        if (newPlan == null || newPlan.Status != PlanStatus.Active)
        {
            return ApiResponse<string>.FailureResponse("Selected plan was not found.");
        }

        string? newStripePriceId = billingCycle == BillingCycle.Monthly 
            ? newPlan.StripeMonthlyPriceId 
            : newPlan.StripeYearlyPriceId;

        if (string.IsNullOrEmpty(newStripePriceId))
        {
            return ApiResponse<string>.FailureResponse("The selected plan is missing pricing information.");
        }

        // Call Stripe to schedule the upgrade
        var success = await _stripePaymentGateway.ScheduleSubscriptionUpgradeAsync(activeSubscription.StripeSubscriptionId, newStripePriceId);
        if (!success)
        {
            return ApiResponse<string>.FailureResponse("Failed to schedule subscription update in Stripe.");
        }

        // Update the active subscription to be Scheduled
        activeSubscription.PlanId = newPlan.Id;
        activeSubscription.BillingCycle = billingCycle;
        activeSubscription.Status = SubscriptionStatus.Scheduled;
        
        // StartDate will be the end of the current billing cycle
        activeSubscription.StartDate = activeSubscription.EndDate ?? DateTime.UtcNow;
        activeSubscription.EndDate = billingCycle == BillingCycle.Monthly 
            ? (activeSubscription.EndDate ?? DateTime.UtcNow).AddMonths(1) 
            : (activeSubscription.EndDate ?? DateTime.UtcNow).AddYears(1);
        activeSubscription.UpdatedAt = DateTime.UtcNow;
        
        await _subscriptionRepository.UpdateAsync(activeSubscription);
        await _subscriptionRepository.SaveChangesAsync();

        return ApiResponse<string>.SuccessResponse("Subscription upgrade scheduled successfully.", "Success");
    }

    /// <summary>
    /// Previews the prorated amount the user will be charged if they upgrade immediately.
    /// </summary>
    public async Task<ApiResponse<decimal>> PreviewUpgradeProrationAsync(int tenantId, int planId, BillingCycle billingCycle)
    {
        var activeSubscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        if (activeSubscription == null || string.IsNullOrEmpty(activeSubscription.StripeSubscriptionId) || string.IsNullOrEmpty(activeSubscription.StripeCustomerId))
        {
            return ApiResponse<decimal>.FailureResponse("You dont have an active Stripe subscription to preview.");
        }

        var newPlan = await _planRepository.GetByIdAsync(planId);
        if (newPlan == null || newPlan.Status != PlanStatus.Active)
        {
            return ApiResponse<decimal>.FailureResponse("Selected plan was not found.");
        }

        string? newStripePriceId = billingCycle == BillingCycle.Monthly 
            ? newPlan.StripeMonthlyPriceId 
            : newPlan.StripeYearlyPriceId;

        if (string.IsNullOrEmpty(newStripePriceId))
        {
            return ApiResponse<decimal>.FailureResponse("The selected plan is missing pricing information.");
        }

        try 
        {
            var amountDue = await _stripePaymentGateway.PreviewUpgradeProrationAsync(
                activeSubscription.StripeCustomerId, 
                activeSubscription.StripeSubscriptionId, 
                newStripePriceId);

            return ApiResponse<decimal>.SuccessResponse(amountDue, "Success");
        }
        catch (Exception ex)
        {
            return ApiResponse<decimal>.FailureResponse($"Failed to preview proration: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<SaaS.Application.DTOs.Payements.SavedCardDto>>> GetSavedPaymentMethodsAsync(int tenantId)
    {
        var activeSubscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        if (activeSubscription == null || string.IsNullOrEmpty(activeSubscription.StripeCustomerId))
        {
            return ApiResponse<List<SaaS.Application.DTOs.Payements.SavedCardDto>>.FailureResponse("No active Stripe customer found.");
        }

        try
        {
            var cards = await _stripePaymentGateway.GetSavedPaymentMethodsAsync(activeSubscription.StripeCustomerId);
            return ApiResponse<List<SaaS.Application.DTOs.Payements.SavedCardDto>>.SuccessResponse(cards, "Success");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<DTOs.Payements.SavedCardDto>>.FailureResponse($"Failed to fetch cards: {ex.Message}");
        }
    }
    public async Task<ApiResponse<string>> CreateSetupIntentAsync(int tenantId)
    {
        var activeSubscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        if (activeSubscription == null || string.IsNullOrEmpty(activeSubscription.StripeCustomerId))
        {
            return ApiResponse<string>.FailureResponse("No active Stripe customer found.");
        }

        try
        {
            var clientSecret = await _stripePaymentGateway.CreateSetupIntentAsync(activeSubscription.StripeCustomerId);
            return ApiResponse<string>.SuccessResponse(clientSecret, "Success");
        }
        catch (Exception ex)
        {
            return ApiResponse<string>.FailureResponse($"Failed to create setup intent: {ex.Message}");
        }
    }


    public async Task<ApiResponse<string>> UpgradeSubscriptionImmediatelyWithCardAsync(int tenantId, int planId, BillingCycle billingCycle, string paymentMethodId)
    {
        var activeSubscription = await _subscriptionRepository.GetActiveByTenantIdAsync(tenantId);
        if (activeSubscription == null || string.IsNullOrEmpty(activeSubscription.StripeSubscriptionId) || string.IsNullOrEmpty(activeSubscription.StripeCustomerId))
        {
            return ApiResponse<string>.FailureResponse("You dont have an active Stripe subscription.");
        }

        var newPlan = await _planRepository.GetByIdAsync(planId);
        if (newPlan == null || newPlan.Status != PlanStatus.Active)
        {
            return ApiResponse<string>.FailureResponse("Selected plan was not found.");
        }

        string? newStripePriceId = billingCycle == BillingCycle.Monthly 
            ? newPlan.StripeMonthlyPriceId 
            : newPlan.StripeYearlyPriceId;

        if (string.IsNullOrEmpty(newStripePriceId))
        {
            return ApiResponse<string>.FailureResponse("The selected plan is missing pricing information.");
        }

        try 
        {
            var success = await _stripePaymentGateway.UpgradeSubscriptionImmediatelyWithCardAsync(
                activeSubscription.StripeCustomerId, 
                activeSubscription.StripeSubscriptionId, 
                newStripePriceId,
                paymentMethodId);

            if (!success)
            {
                return ApiResponse<string>.FailureResponse("Failed to update subscription in Stripe.");
            }

            activeSubscription.PlanId = newPlan.Id;
            activeSubscription.BillingCycle = billingCycle;
            activeSubscription.UpdatedAt = DateTime.UtcNow;
            
            await _subscriptionRepository.UpdateAsync(activeSubscription);
            await _subscriptionRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse("Subscription upgraded successfully.", "Success");
        }
        catch (Exception ex)
        {
            return ApiResponse<string>.FailureResponse($"Failed to upgrade subscription: {ex.Message}");
        }
    }
}
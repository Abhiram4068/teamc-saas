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
            // Instead of mutating the active subscription, we create a new one
            var startDate = subscription.EndDate ?? DateTime.UtcNow;
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

    public async Task<ApiResponse<string>> CompleteCheckoutAsync(string sessionId, string customerId, string subscriptionId)
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

        // Update Payment
        payment.Status = PaymentStatus.Succeeded;
        payment.PaymentDate = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        await _paymentRepository.UpdateAsync(payment);

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
        
        if (subscription == null)
        {
            return ApiResponse<SubscriptionResponseDto>.SuccessResponse(new SubscriptionResponseDto 
            { 
                HasActiveSubscription = false 
            }, "No active subscription found.");
        }

        var dto = new SubscriptionResponseDto
        {
            HasActiveSubscription = true,
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
}
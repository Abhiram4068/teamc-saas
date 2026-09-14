using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Payment;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly IPlanRepository _planRepository;
    private readonly IStripePaymentGateway _stripePaymentGateway;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPlanFeatureRepository _planFeatureRepository;

    public SubscriptionService(
        IPlanRepository planRepository,
        IStripePaymentGateway stripePaymentGateway,
        ISubscriptionRepository subscriptionRepository,
        IUserRepository userRepository,
        IPlanFeatureRepository planFeatureRepository)
    {
        _planRepository = planRepository;
        _stripePaymentGateway = stripePaymentGateway;
        _subscriptionRepository = subscriptionRepository;
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

        // Create Stripe Checkout Session
        var checkoutResult =
            await _stripePaymentGateway.CreateCheckoutSessionAsync(
                tenantId,
                userId,
                stripePriceId);

        // Return checkout details
        var response = new CheckoutResponseDto
        {
            SessionId = checkoutResult.SessionId,
            CheckoutUrl = checkoutResult.CheckoutUrl
        };

        return ApiResponse<CheckoutResponseDto>.SuccessResponse(response);
    }

    public async Task<ApiResponse<SubscriptionResponseDto>> GetCurrentSubscriptionAsync(int tenantId)
    {
        var user = await _userRepository.GetByIdAsync(tenantId);

        if (user == null)
        {
            return ApiResponse<SubscriptionResponseDto>.FailureResponse("Tenant not found.");
        }

        var subscription = await _subscriptionRepository.GetByTenantIdAsync(tenantId);
        
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
            CurrentPeriodEnd = subscription.EndDate
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
}
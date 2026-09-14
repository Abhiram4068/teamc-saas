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

    public SubscriptionService(
        IPlanRepository planRepository,
        IStripePaymentGateway stripePaymentGateway)
    {
        _planRepository = planRepository;
        _stripePaymentGateway = stripePaymentGateway;
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
}
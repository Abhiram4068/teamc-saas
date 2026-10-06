using FluentValidation;
using SaaS.Application.DTOs.Requests;
using SaaS.Domain.Enums;

namespace SaaS.Application.Validators;

public class UpgradeSubscriptionWithCardRequestValidator : AbstractValidator<UpgradeSubscriptionWithCardRequestDto>
{
    public UpgradeSubscriptionWithCardRequestValidator()
    {
        RuleFor(x => x.PlanId)
            .GreaterThan(0).WithMessage("PlanId is required and must be greater than 0.");

        RuleFor(x => x.BillingCycle)
            .IsInEnum().WithMessage("Invalid BillingCycle.");

        RuleFor(x => x.PaymentMethodId)
            .NotEmpty().WithMessage("PaymentMethodId is required.");
    }
}

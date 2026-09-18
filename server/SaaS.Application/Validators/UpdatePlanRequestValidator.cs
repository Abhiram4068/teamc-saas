using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class UpdatePlanRequestValidator : AbstractValidator<UpdatePlanRequestDto>
{
    public UpdatePlanRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Plan name is required.")
            .MaximumLength(100).WithMessage("Plan name must not exceed 100 characters.");

        RuleFor(x => x.Rank)
            .GreaterThan(0).WithMessage("Plan Rank must be greater than 0.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.TrialPeriodDays)
            .GreaterThanOrEqualTo(0).When(x => x.TrialPeriodDays.HasValue)
            .WithMessage("Trial period days cannot be negative.");
    }
}

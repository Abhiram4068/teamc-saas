using FluentValidation;
using SaaS.Application.DTOs.Requests;
using SaaS.Domain.Enums;

namespace SaaS.Application.Validators;

public class CreatePlanRequestValidator : AbstractValidator<CreatePlanRequestDto>
{
    public CreatePlanRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Plan Name is required.")
            .MinimumLength(3).WithMessage("Plan Name must be at least 3 characters.")
            .MaximumLength(100).WithMessage("Plan Name must not exceed 100 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Plan Code is required.")
            .MaximumLength(50).WithMessage("Plan Code must not exceed 50 characters.")
            .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("Plan Code must contain only letters, numbers, underscores, or hyphens.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.Status)
            .Must(s => s == PlanStatus.Draft || s == PlanStatus.Inactive)
            .WithMessage("Plan Status must be either Draft or Inactive.");

        RuleFor(x => x.MonthlyPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Monthly Price must be 0 (for free plans) or greater (for paid plans).");

        RuleFor(x => x.YearlyPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Yearly Price must be 0 (for free plans) or greater (for paid plans).");

        RuleFor(x => x.TrialPeriodDays)
            .GreaterThanOrEqualTo(0).When(x => x.TrialPeriodDays.HasValue).WithMessage("Trial Period Days must be greater than or equal to 0.");
            
        RuleFor(x => x.Currency)
            .IsInEnum().WithMessage("Invalid Currency.");
    }
}

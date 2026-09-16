using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class MapPlanFeatureRequestValidator : AbstractValidator<MapPlanFeatureRequestDto>
{
    public MapPlanFeatureRequestValidator()
    {
        RuleFor(x => x.PlanId)
            .GreaterThan(0).WithMessage("Plan ID is required and must be greater than 0.");

        RuleFor(x => x.Features)
            .NotEmpty().WithMessage("At least one Feature must be provided.")
            .Must(features => features != null && features.All(f => f.FeatureId > 0))
            .WithMessage("All Feature IDs must be greater than 0.");
    }
}

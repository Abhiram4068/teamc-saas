using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class MapPlanFeatureRequestValidator : AbstractValidator<MapPlanFeatureRequestDto>
{
    public MapPlanFeatureRequestValidator()
    {
        RuleFor(x => x.PlanId)
            .GreaterThan(0).WithMessage("Plan ID is required and must be greater than 0.");

        RuleFor(x => x.FeatureIds)
            .NotEmpty().WithMessage("At least one Feature ID must be provided.")
            .Must(ids => ids != null && ids.All(id => id > 0)).WithMessage("All Feature IDs must be greater than 0.");
    }
}

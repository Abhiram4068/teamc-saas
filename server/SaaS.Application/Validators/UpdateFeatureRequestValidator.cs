using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class UpdateFeatureRequestValidator : AbstractValidator<UpdateFeatureRequestDto>
{
    public UpdateFeatureRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MinimumLength(3).WithMessage("Name must be at least 3 characters.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters.")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}

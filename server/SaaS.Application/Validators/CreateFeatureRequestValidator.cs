using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

/// <summary>
/// FluentValidation validator for <see cref="CreateFeatureRequestDto"/>.
/// </summary>
public class CreateFeatureRequestValidator : AbstractValidator<CreateFeatureRequestDto>
{
    public CreateFeatureRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Feature Name is required.")
            .MaximumLength(100).WithMessage("Feature Name must not exceed 100 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Feature Code is required.")
            .MaximumLength(50).WithMessage("Feature Code must not exceed 50 characters.")
            .Matches(@"^[A-Z0-9_-]+$").WithMessage("Feature Code must contain only uppercase letters, numbers, underscores, or hyphens.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid Feature Status.");
    }
}

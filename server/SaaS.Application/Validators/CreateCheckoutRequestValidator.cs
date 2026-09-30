using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class CreateCheckoutRequestValidator : AbstractValidator<CreateCheckoutRequestDto>
{
    public CreateCheckoutRequestValidator()
    {
        RuleFor(x => x.OrganizationName)
            .NotEmpty().WithMessage("Organization name is required.")
            .MinimumLength(2).WithMessage("Organization name must be at least 2 characters.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MinimumLength(2).WithMessage("Address must be at least 2 characters.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MinimumLength(2).WithMessage("City must be at least 2 characters.");

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required.")
            .Matches(@"^\d+$").WithMessage("Pincode must contain only numbers.")
            .Length(6).WithMessage("Pincode must be exactly 6 digits.")
            .Must(x => x == null || !x.StartsWith("0")).WithMessage("Pincode cannot start with 0.");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required.");
    }
}

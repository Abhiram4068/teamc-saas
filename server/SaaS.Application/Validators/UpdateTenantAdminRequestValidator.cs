using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class UpdateTenantAdminRequestValidator : AbstractValidator<UpdateTenantAdminRequestDto>
{
    public UpdateTenantAdminRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^[0-9\+\-\s\(\)]+$").WithMessage("Invalid phone number format.")
            .MaximumLength(15).WithMessage("Phone number cannot exceed 15 characters.");
    }
}

using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class RegisterTenantRequestValidator : AbstractValidator<RegisterTenantRequestDto>
{
    public RegisterTenantRequestValidator()
    {
        RuleFor(x => x.Cin)
            .NotEmpty().WithMessage("CIN is required.")
            .MinimumLength(21).WithMessage("CIN must be exactly 21 characters long.")
            .MaximumLength(21).WithMessage("CIN must be exactly 21 characters long.");

        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company Name is required.")
            .MaximumLength(100).WithMessage("Company Name cannot exceed 100 characters.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(250).WithMessage("Address cannot exceed 250 characters.");

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required.")
            .MinimumLength(5).WithMessage("Pincode must be at least 5 characters.")
            .MaximumLength(10).WithMessage("Pincode cannot exceed 10 characters.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First Name is required.")
            .MaximumLength(50).WithMessage("First Name cannot exceed 50 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last Name is required.")
            .MaximumLength(50).WithMessage("Last Name cannot exceed 50 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .MaximumLength(50).WithMessage("Password cannot exceed 50 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone Number is required.")
            .MinimumLength(10).WithMessage("Phone Number must be at least 10 characters.")
            .MaximumLength(15).WithMessage("Phone Number cannot exceed 15 characters.");
    }
}

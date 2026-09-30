using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class TenantCreateTenantAdminRequestValidator : AbstractValidator<TenantCreateTenantAdminRequestDto>
{
    public TenantCreateTenantAdminRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MinimumLength(3).WithMessage("First name must be at least 3 characters long.")
            .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.")
            .Matches("^[a-zA-Z]+$").WithMessage("First name can only contain alphabets.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MinimumLength(3).WithMessage("Last name must be at least 3 characters long.")
            .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters.")
            .Matches("^[a-zA-Z]+$").WithMessage("Last name can only contain alphabets.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches("^[0-9]+$").WithMessage("Phone number can only contain numbers.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.");
            
        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm Password is required.")
            .Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}

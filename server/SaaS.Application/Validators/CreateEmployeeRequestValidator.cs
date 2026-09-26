using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class CreateEmployeeRequestValidator : AbstractValidator<CreateEmployeeRequestDto>
{
    public CreateEmployeeRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First Name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last Name is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("DepartmentId must be greater than 0.");

        RuleFor(x => x.DesignationId)
            .GreaterThan(0).WithMessage("DesignationId must be greater than 0.");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("A valid Role is required.");
    }
}

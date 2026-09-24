using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class DocumentUpdateRequestValidator : AbstractValidator<DocumentUpdateRequestDto>
{
    public DocumentUpdateRequestValidator()
    {
        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("Display Name is required.")
            .MaximumLength(255).WithMessage("Display Name cannot exceed 255 characters.");
    }
}

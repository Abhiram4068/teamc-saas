using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class DocumentUploadRequestValidator : AbstractValidator<DocumentUploadRequestDto>
{
    public DocumentUploadRequestValidator()
    {
        RuleFor(x => x.Files)
            .NotNull().WithMessage("Files are required.")
            .NotEmpty().WithMessage("At least one file must be uploaded.");

        RuleFor(x => x.DisplayName)
            .MaximumLength(255).WithMessage("Display Name cannot exceed 255 characters.");
    }
}

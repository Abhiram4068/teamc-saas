using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class CreateTicketRequestDtoValidator : AbstractValidator<CreateTicketRequestDto>
{
    public CreateTicketRequestDtoValidator()
    {
        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.")
            .MaximumLength(255).WithMessage("Subject must not exceed 255 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters.");
            
        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid priority level.");
    }
}

public class TicketReplyRequestDtoValidator : AbstractValidator<TicketReplyRequestDto>
{
    public TicketReplyRequestDtoValidator()
    {
        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Reply message cannot be empty.");
    }
}

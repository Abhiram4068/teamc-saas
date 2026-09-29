using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class CreateTicketRequestDtoValidator : AbstractValidator<CreateTicketRequestDto>
{
    public CreateTicketRequestDtoValidator()
    {
        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.")
            .MinimumLength(5).WithMessage("Subject must be at least 5 characters long.")
            .MaximumLength(200).WithMessage("Subject cannot exceed 200 characters.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.");
            
        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Priority is required.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(5).WithMessage("Description must be at least 5 characters long.")
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");
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

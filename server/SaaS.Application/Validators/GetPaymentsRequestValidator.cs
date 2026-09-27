using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class GetPaymentsRequestValidator : AbstractValidator<GetPaymentsRequestDto>
{
    public GetPaymentsRequestValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("Page size must be at least 1.")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100.");
            
        RuleFor(x => x.SortOrder)
            .Must(x => string.IsNullOrEmpty(x) || x.Equals("asc", StringComparison.OrdinalIgnoreCase) || x.Equals("desc", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Sort order must be 'asc' or 'desc'.");
    }
}

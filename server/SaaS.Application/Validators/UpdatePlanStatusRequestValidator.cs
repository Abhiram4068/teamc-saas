using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class UpdatePlanStatusRequestValidator : AbstractValidator<UpdatePlanStatusRequestDto>
{
    public UpdatePlanStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid plan status.");
    }
}

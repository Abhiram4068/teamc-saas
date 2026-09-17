using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class UpdateFeatureStatusRequestValidator : AbstractValidator<UpdateFeatureStatusRequestDto>
{
    public UpdateFeatureStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid status value.");
    }
}

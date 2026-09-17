using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class UpdateTenantAdminStatusRequestValidator : AbstractValidator<UpdateTenantAdminStatusRequestDto>
{
    public UpdateTenantAdminStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid status value.");
    }
}

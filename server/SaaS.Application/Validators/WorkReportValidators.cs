using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class CreateWorkReportDtoValidator : AbstractValidator<CreateWorkReportDto>
{
    public CreateWorkReportDtoValidator()
    {
        RuleFor(x => x.WorkTypeId).GreaterThan(0).WithMessage("WorkType is required.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name cannot be empty.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description cannot be empty.");
        RuleFor(x => x.HoursSpent).GreaterThan(0).WithMessage("Hours spent must be greater than zero.");
        RuleFor(x => x.WorkDate).NotEmpty().WithMessage("Work date is required.");
        RuleFor(x => x.Status).IsInEnum().WithMessage("Invalid status.");
    }
}

public class UpdateWorkReportDtoValidator : AbstractValidator<UpdateWorkReportDto>
{
    public UpdateWorkReportDtoValidator()
    {
        RuleFor(x => x.WorkTypeId).GreaterThan(0).WithMessage("WorkType is required.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name cannot be empty.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description cannot be empty.");
        RuleFor(x => x.HoursSpent).GreaterThan(0).WithMessage("Hours spent must be greater than zero.");
        RuleFor(x => x.WorkDate).NotEmpty().WithMessage("Work date is required.");
        RuleFor(x => x.Status).IsInEnum().WithMessage("Invalid status.");
    }
}

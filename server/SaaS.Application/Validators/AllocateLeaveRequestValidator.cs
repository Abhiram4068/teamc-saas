using FluentValidation;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Validators;

public class AllocateLeaveRequestValidator : AbstractValidator<AllocateLeaveRequestDto>
{
    public AllocateLeaveRequestValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required and must be greater than 0.");

        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("Leave Type ID is required and must be greater than 0.");

        RuleFor(x => x.TotalDays)
            .GreaterThanOrEqualTo(0).WithMessage("Total Days must be a positive number or zero.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, 2100).WithMessage("Please provide a valid year.");
    }
}

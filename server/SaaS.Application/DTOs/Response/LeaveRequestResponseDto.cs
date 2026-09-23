using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class LeaveRequestResponseDto
{
    public int Id { get; set; }
    public string LeaveType { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal NumberOfDays { get; set; }
    public LeaveStatus Status { get; set; }
    public string Reason { get; set; } = null!;
    public string? ManagerComment { get; set; }
    public DateTime CreatedAt { get; set; }
}

namespace SaaS.Application.DTOs.Requests;

public class AllocateLeaveRequestDto
{
    public long EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public decimal TotalDays { get; set; }
    public int Year { get; set; }
}

namespace SaaS.Application.DTOs.Response;

public class EmployeeLeaveBalancesResponseDto
{
    public long EmployeeId { get; set; } // This is User.Id
    public string EmployeeName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Designation { get; set; }
    
    public IEnumerable<LeaveBalanceItemDto> Balances { get; set; } = new List<LeaveBalanceItemDto>();
}

public class LeaveBalanceItemDto
{
    public int Id { get; set; }
    public int LeaveTypeId { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public decimal TotalLeaves { get; set; }
    public decimal UsedLeaves { get; set; }
    public decimal RemainingLeaves { get; set; }
    public int Year { get; set; }
}

namespace SaaS.Domain.Entities;

public class EmployeeLeaveBalance
{
    public int Id { get; set; }

    public long TenantId { get; set; }

    public long EmployeeId { get; set; } // Updated to long to match User.Id

    public int LeaveTypeId { get; set; }

    public int Year { get; set; }

    public decimal TotalDays { get; set; }

    public decimal UsedDays { get; set; }

    // Navigation
    public Tenant Tenant { get; set; } = null!;

    public User Employee { get; set; } = null!;

    public LeaveType LeaveType { get; set; } = null!;
}

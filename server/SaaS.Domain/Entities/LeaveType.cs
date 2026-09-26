using System.Collections.Generic;

namespace SaaS.Domain.Entities;

public class LeaveType
{
    public int Id { get; set; }

    public long TenantId { get; set; }

    public string Name { get; set; } = null!;

    public string Code { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public Tenant Tenant { get; set; } = null!;

    public ICollection<EmployeeLeaveBalance> EmployeeLeaveBalances { get; set; }
        = new List<EmployeeLeaveBalance>();

    public ICollection<LeaveRequest> LeaveRequests { get; set; }
        = new List<LeaveRequest>();
}

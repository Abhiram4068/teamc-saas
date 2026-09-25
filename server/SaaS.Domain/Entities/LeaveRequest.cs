using System;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class LeaveRequest
{
    public int Id { get; set; }

    public long TenantId { get; set; }

    public long EmployeeId { get; set; } // Updated from int to long to match User.Id which is long

    public long ManagerId { get; set; } // Updated from int to long to match User.Id which is long

    public int LeaveTypeId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public decimal NumberOfDays { get; set; }

    public string Reason { get; set; } = null!;

    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;

    public string? ManagerComment { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Tenant Tenant { get; set; } = null!;

    public User Employee { get; set; } = null!;

    public User Manager { get; set; } = null!;

    public LeaveType LeaveType { get; set; } = null!;
}

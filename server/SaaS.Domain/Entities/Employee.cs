namespace SaaS.Domain.Entities;

public class Employee
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public long TenantId { get; set; }

    public int? DesignationId { get; set; }
    
    public int? DepartmentId { get; set; }

    public DateTime JoiningDate { get; set; }

    public long? ReportingManagerId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;

    public Tenant Tenant { get; set; } = null!;

    public Department? Department { get; set; }

    public Designation? Designation { get; set; }

    public Employee? ReportingManager { get; set; }

    public ICollection<Employee> DirectReports { get; set; }
        = new List<Employee>();
}
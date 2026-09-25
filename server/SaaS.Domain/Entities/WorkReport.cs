using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class WorkReport
{
    public long Id { get; set; }
    public long TenantId { get; set; }
    public long UserId { get; set; }
    public int WorkTypeId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal HoursSpent { get; set; }
    public WorkReportStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public User User { get; set; } = null!;
    public WorkType WorkType { get; set; } = null!;
}

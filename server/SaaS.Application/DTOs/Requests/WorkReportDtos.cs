using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class WorkReportDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal HoursSpent { get; set; }
    public WorkReportStatus Status { get; set; }
    public WorkTypeDto WorkType { get; set; } = null!;
}

public class GroupedWorkReportDto
{
    public string Date { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public WorkReportStatus Status { get; set; }
    public IEnumerable<WorkReportDto> Reports { get; set; } = new List<WorkReportDto>();
}

public class CreateWorkReportDto
{
    public int WorkTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal HoursSpent { get; set; }
    public WorkReportStatus Status { get; set; }
}

public class UpdateWorkReportDto
{
    public int WorkTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal HoursSpent { get; set; }
    public WorkReportStatus Status { get; set; }
}

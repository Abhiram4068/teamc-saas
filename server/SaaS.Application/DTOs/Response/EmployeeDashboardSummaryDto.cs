namespace SaaS.Application.DTOs.Response;

public class EmployeeDashboardSummaryDto
{
    // HR / Tenant Admin metrics
    public int? TotalEmployees { get; set; }
    public int? TotalManagers { get; set; }
    
    // Manager metrics
    public int? ReportingEmployees { get; set; }
    
    // Employee metrics (Common for all as well)
    public int? TotalLeaves { get; set; }
}

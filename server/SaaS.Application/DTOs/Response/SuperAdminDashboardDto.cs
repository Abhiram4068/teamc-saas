namespace SaaS.Application.DTOs.Response;

public class SuperAdminDashboardDto
{
    public SuperAdminDashboardMetricsDto Metrics { get; set; } = new();
    public List<SuperAdminDashboardTenantDto> RecentTenants { get; set; } = new();
    public List<SuperAdminDashboardPlanDto> ActivePlans { get; set; } = new();
}

public class SuperAdminDashboardMetricsDto
{
    public MetricDto TotalRevenue { get; set; } = new();
    public MetricDto TotalTenants { get; set; } = new();
    public MetricDto ActiveSubscriptions { get; set; } = new();
    public MetricDto TotalPlans { get; set; } = new();
    public MetricDto TotalFeatures { get; set; } = new();
    public MetricDto PopularPlan { get; set; } = new();
    public MetricDto SupportTickets { get; set; } = new();
    public MetricDto RecentTenantsAdded { get; set; } = new();
    public MetricDto RecentPayments { get; set; } = new();
    public MetricDto TotalUsers { get; set; } = new();
}

public class MetricDto
{
    public object Value { get; set; } = string.Empty;
}

public class SuperAdminDashboardTenantDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Mrr { get; set; }
}

public class SuperAdminDashboardPlanDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public int ActiveTenantsCount { get; set; }
    public int Price { get; set; }
}

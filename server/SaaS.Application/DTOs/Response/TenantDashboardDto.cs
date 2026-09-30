namespace SaaS.Application.DTOs.Response;

public class TenantDashboardDto
{
    public int TotalAdmins { get; set; }
    public string CurrentActivePlan { get; set; } = string.Empty;
    public string NextPaymentDate { get; set; } = string.Empty;
}

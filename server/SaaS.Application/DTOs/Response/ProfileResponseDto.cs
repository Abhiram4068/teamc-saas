using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class ProfileResponseDto
{
    public long Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Role Role { get; set; }
    
    // Tenant related info (if any)
    public long? TenantId { get; set; }
    public string? CompanyName { get; set; }
    
    // Plan related info
    public string? CurrentPlanName { get; set; }
}

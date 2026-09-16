using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class TenantListResponseDto
{
    public long Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string CIN { get; set; } = string.Empty;
    public TenantStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    // Primary Contact Details (User with Role = Tenant)
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}

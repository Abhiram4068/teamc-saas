using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class TenantAdminResponseDto
{
    public long Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public UserStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

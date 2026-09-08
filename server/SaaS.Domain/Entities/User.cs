using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class User
{
    public int Id { get; set; }

    // Nullable: SuperAdmin belongs to no tenant
    public int? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
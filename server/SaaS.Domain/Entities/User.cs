using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class User
{
    public long Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PasswordHash { get; set; }

    public string? PhoneNumber { get; set; }

    // Nullable because SuperAdmin does not belong to a tenant.
    public long? TenantId { get; set; }

    public Role Role { get; set; }

    public UserStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    
    public DateTime? LastLogin { get; set; }

    // Navigation
    public Tenant? Tenant { get; set; }

    public Employee? Employee { get; set; }
}
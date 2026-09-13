using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Tenant
{
    public long Id { get; set; }

    public string CIN { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public string? Address { get; set; }

    public string? Pincode { get; set; }

    public TenantStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class EmployeeDetailedResponseDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? DesignationId { get; set; }
    public string? DesignationName { get; set; }
    public Role Role { get; set; }
    
    // Detailed metrics
    public string Status { get; set; } = string.Empty;
    public DateTime DateOfJoining { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLogin { get; set; }
    public string? EmployeeCode { get; set; }   
    
    // Manager Details
    public long? ReportingManagerId { get; set; }
    public string? ManagerName { get; set; }
}

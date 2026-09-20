using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class EmployeeResponseDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? DesignationId { get; set; }
    public string? DesignationName { get; set; }
    public Role Role { get; set; }
    public DateTime JoiningDate { get; set; }
    public long? ReportingManagerId { get; set; }
}

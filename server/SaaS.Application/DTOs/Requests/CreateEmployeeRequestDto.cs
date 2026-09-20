namespace SaaS.Application.DTOs.Requests;

public class CreateEmployeeRequestDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public int DepartmentId { get; set; }
    public int DesignationId { get; set; }
    public DateTime JoiningDate { get; set; } = DateTime.UtcNow;
    public SaaS.Domain.Enums.Role Role { get; set; }
}

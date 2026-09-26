namespace SaaS.Application.DTOs.Response;

public class DesignationDto
{
    public int Id { get; set; }
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

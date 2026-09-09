using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

/// <summary>
/// Response DTO containing details of a feature capability.
/// </summary>
public class FeatureResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public FeatureStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

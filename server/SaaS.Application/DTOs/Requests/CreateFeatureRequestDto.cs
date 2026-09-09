using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

/// <summary>
/// Request DTO for creating a new feature capability.
/// </summary>
public class CreateFeatureRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public FeatureStatus Status { get; set; } = FeatureStatus.Active;
}

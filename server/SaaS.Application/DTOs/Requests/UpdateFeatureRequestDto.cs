namespace SaaS.Application.DTOs.Requests;

public class UpdateFeatureRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class GetFeaturesRequestDto
{
    public string? SearchTerm { get; set; }
    public FeatureStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

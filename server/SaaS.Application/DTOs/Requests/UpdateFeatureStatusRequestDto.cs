using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class UpdateFeatureStatusRequestDto
{
    public FeatureStatus Status { get; set; }
}

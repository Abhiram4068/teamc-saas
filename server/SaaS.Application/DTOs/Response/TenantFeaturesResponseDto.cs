using System.Collections.Generic;

namespace SaaS.Application.DTOs.Response;

public class TenantFeaturesResponseDto
{
    public PlanSummaryDto Plan { get; set; } = new PlanSummaryDto();
    public List<FeatureSummaryDto> Features { get; set; } = new List<FeatureSummaryDto>();
}

public class PlanSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class FeatureSummaryDto
{
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public int? Limit { get; set; }
}

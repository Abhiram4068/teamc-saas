using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class GetPlansRequestDto
{
    public string? SearchTerm { get; set; }
    public PlanStatus? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

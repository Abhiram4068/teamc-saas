using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class TenantQueryRequestDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public TenantStatus? Status { get; set; }
}

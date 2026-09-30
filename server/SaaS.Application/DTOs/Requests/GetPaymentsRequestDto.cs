using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class GetPaymentsRequestDto
{
    public string? SearchTerm { get; set; }
    public PaymentStatus? Status { get; set; }
    public string? SortColumn { get; set; }
    public string? SortOrder { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

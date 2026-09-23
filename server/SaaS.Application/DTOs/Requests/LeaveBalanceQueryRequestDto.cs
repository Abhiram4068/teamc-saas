namespace SaaS.Application.DTOs.Requests;

public class LeaveBalanceQueryRequestDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
    public int? DesignationId { get; set; }
}

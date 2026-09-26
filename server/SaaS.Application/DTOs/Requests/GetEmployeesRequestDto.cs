namespace SaaS.Application.DTOs.Requests;

public class GetEmployeesRequestDto
{
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public long? ReportingManagerId { get; set; }
}

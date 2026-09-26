namespace SaaS.Application.DTOs.Requests;

public class DocumentQueryRequestDto
{
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

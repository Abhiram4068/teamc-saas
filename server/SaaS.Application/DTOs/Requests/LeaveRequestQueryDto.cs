namespace SaaS.Application.DTOs.Requests;

public class LeaveRequestQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

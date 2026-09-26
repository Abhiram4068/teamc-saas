namespace SaaS.Application.DTOs.Response;

public class TeamLeaveRequestResponseDto : LeaveRequestResponseDto
{
    public string EmployeeName { get; set; } = null!;
}

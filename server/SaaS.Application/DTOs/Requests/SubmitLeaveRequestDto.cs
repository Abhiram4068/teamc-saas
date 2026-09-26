using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Requests;

public class SubmitLeaveRequestDto
{
    [Required]
    public int LeaveTypeId { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = null!;
}

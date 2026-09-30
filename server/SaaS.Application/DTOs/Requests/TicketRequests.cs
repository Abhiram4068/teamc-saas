using Microsoft.AspNetCore.Http;
using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class CreateTicketRequestDto
{
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    
    public List<IFormFile>? Attachments { get; set; }
}

public class TicketReplyRequestDto
{
    public string Message { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class UpdateTicketStatusRequestDto
{
    public TicketStatus Status { get; set; }
}

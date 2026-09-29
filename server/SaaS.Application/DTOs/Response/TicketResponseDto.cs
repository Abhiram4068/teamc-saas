using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class TicketResponseDto
{
    public long Id { get; set; }
    public long? TenantId { get; set; }
    public string RaisedByEmail { get; set; } = string.Empty;
    public string AssignedToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int AttachmentsCount { get; set; }
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class TicketDetailsResponseDto : TicketResponseDto
{
    public List<TicketReplyResponseDto> Replies { get; set; } = new();
}

public class TicketReplyResponseDto
{
    public long Id { get; set; }
    public string ReplyByEmail { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

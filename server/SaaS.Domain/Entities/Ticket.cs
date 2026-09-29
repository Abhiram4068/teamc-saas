using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Ticket
{
    public long Id { get; set; }
    public long? TenantId { get; set; }
    public string RaisedByEmail { get; set; } = string.Empty;
    public string AssignedToEmail { get; set; } = string.Empty;
    
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<TicketReply> Replies { get; set; } = new List<TicketReply>();
}

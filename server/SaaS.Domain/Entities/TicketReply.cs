namespace SaaS.Domain.Entities;

public class TicketReply
{
    public long Id { get; set; }
    public long TicketId { get; set; }
    public string ReplyByEmail { get; set; } = string.Empty;
    
    public string Message { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public Ticket Ticket { get; set; } = null!;
}

using SaaS.Domain.Enums;

namespace SaaS.Domain.Entities;

public class Document
{
    public long Id { get; set; }
    
    public string DisplayName { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string StorageName { get; set; } = string.Empty; // Mapped name in local folder
    
    public string ContentType { get; set; } = string.Empty;
    
    public long SizeInBytes { get; set; }
    
    public long TenantId { get; set; }
    
    public long UserId { get; set; }
    
    public DocumentStatus Status { get; set; }
    
    public DateTime UploadedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public Tenant? Tenant { get; set; }
    public User? User { get; set; }
}

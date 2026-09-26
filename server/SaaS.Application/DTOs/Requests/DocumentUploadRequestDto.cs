using Microsoft.AspNetCore.Http;

namespace SaaS.Application.DTOs.Requests;

public class DocumentUploadRequestDto
{
    public List<IFormFile> Files { get; set; } = new();
    
    public string DisplayName { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}

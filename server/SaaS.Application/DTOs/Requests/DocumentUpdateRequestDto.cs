namespace SaaS.Application.DTOs.Requests;

public class DocumentUpdateRequestDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
}

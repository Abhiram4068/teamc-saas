using System;

namespace SaaS.Application.DTOs.Response;

public class DocumentResponseDto
{
    public long Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public string PreviewUrl { get; set; } = string.Empty;
}

public class DocumentListResponseDto
{
    public long Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public DateTime UploadedAt { get; set; }
    public string PreviewUrl { get; set; } = string.Empty;
}

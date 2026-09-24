using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Interfaces.Service;

public interface IDocumentService
{
    Task<ApiResponse<string>> UploadDocumentAsync(long tenantId, long userId, DocumentUploadRequestDto request);
}

using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IDocumentService
{
    Task<ApiResponse<string>> UploadDocumentAsync(long tenantId, long userId, DocumentUploadRequestDto request);
    Task<ApiResponse<PaginatedResponseDto<DocumentListResponseDto>>> GetAllDocumentsAsync(long tenantId, long userId, DocumentQueryRequestDto request);
    Task<ApiResponse<DocumentResponseDto>> GetDocumentByIdAsync(long tenantId, long userId, long documentId);
    Task<(byte[] FileBytes, string ContentType, string FileName)?> GetDocumentFileAsync(long tenantId, long userId, long documentId);
    Task<ApiResponse<string>> UpdateDocumentAsync(long tenantId, long userId, long documentId, DocumentUpdateRequestDto request);
    Task<ApiResponse<string>> DeleteDocumentAsync(long tenantId, long userId, long documentId);
}

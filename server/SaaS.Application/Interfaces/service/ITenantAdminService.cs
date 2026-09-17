using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface ITenantAdminService
{
    Task<ApiResponse<IEnumerable<TenantAdminResponseDto>>> GetTenantAdminsAsync(long tenantId);
    Task<ApiResponse<string>> UpdateTenantAdminAsync(long tenantId, long adminId, UpdateTenantAdminRequestDto request);
    Task<ApiResponse<string>> UpdateTenantAdminStatusAsync(long tenantId, long adminId, UpdateTenantAdminStatusRequestDto request);
    Task<ApiResponse<string>> SoftDeleteTenantAdminAsync(long tenantId, long adminId);
}

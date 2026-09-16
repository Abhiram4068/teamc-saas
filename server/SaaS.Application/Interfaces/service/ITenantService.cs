using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface ITenantService
{
    Task<PagedResponseDto<TenantListResponseDto>> GetTenantsPaginatedAsync(TenantQueryRequestDto query);
}

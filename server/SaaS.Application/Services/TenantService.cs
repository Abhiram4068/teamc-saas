using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class TenantService : ITenantService
{
    private readonly ITenantRepository _tenantRepository;

    public TenantService(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<PagedResponseDto<TenantListResponseDto>> GetTenantsPaginatedAsync(TenantQueryRequestDto query)
    {
        var (tenants, totalCount) = await _tenantRepository.GetPaginatedTenantsAsync(query);

        var data = tenants.Select(t =>
        {
            var primaryContact = t.Users.FirstOrDefault(u => u.Role == Role.Tenant);

            return new TenantListResponseDto
            {
                Id = t.Id,
                CompanyName = t.CompanyName,
                CIN = t.CIN,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                FirstName = primaryContact?.FirstName ?? string.Empty,
                LastName = primaryContact?.LastName ?? string.Empty,
                Email = primaryContact?.Email ?? string.Empty,
                PhoneNumber = primaryContact?.PhoneNumber
            };
        });

        return new PagedResponseDto<TenantListResponseDto>
        {
            Data = data,
            TotalRecords = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }
}

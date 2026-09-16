using SaaS.Application.DTOs.Requests;
using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface ITenantRepository
{
    Task<Tenant?> GetByCinAsync(string cin);
    Task<Tenant?> GetByIdAsync(long id);
    Task AddAsync(Tenant tenant);
    Task<(IEnumerable<Tenant> Tenants, int TotalCount)> GetPaginatedTenantsAsync(TenantQueryRequestDto query);
}

using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface ITenantRepository
{
    Task<Tenant?> GetByCinAsync(string cin);
    Task<Tenant?> GetByIdAsync(long id);
    Task AddAsync(Tenant tenant);
}

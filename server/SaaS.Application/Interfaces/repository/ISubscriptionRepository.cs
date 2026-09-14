using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByTenantIdAsync(int tenantId);
}

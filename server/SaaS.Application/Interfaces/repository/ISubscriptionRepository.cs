using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByIdAsync(Guid id);
    Task<Subscription?> GetByTenantIdAsync(int tenantId);
    Task<Subscription?> GetActiveByTenantIdAsync(int tenantId);
    Task<Subscription?> GetScheduledByTenantIdAsync(int tenantId);
    Task<IEnumerable<Subscription>> GetPendingSubscriptionsByTenantIdAsync(int tenantId);
    Task<Subscription?> GetActiveSubscriptionWithFeaturesAsync(int tenantId);
    Task AddAsync(Subscription subscription);
    Task DeleteAsync(Subscription subscription);
    Task UpdateAsync(Subscription subscription);
    Task SaveChangesAsync();
}

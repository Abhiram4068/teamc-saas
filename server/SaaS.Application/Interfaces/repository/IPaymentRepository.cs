using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IPaymentRepository
{
    Task<SaaS.Domain.Entities.Payment?> GetByIdAsync(Guid id);
    Task<SaaS.Domain.Entities.Payment?> GetByStripeSessionIdAsync(string sessionId);
    Task<IEnumerable<SaaS.Domain.Entities.Payment>> GetByTenantIdAsync(long tenantId);
    Task AddAsync(SaaS.Domain.Entities.Payment payment);
    Task UpdateAsync(SaaS.Domain.Entities.Payment payment);
    Task SaveChangesAsync();
}


namespace SaaS.Application.Interfaces.Repository;

public interface IPaymentRepository
{
    Task<SaaS.Domain.Entities.Payment?> GetByIdAsync(Guid id);
    Task<SaaS.Domain.Entities.Payment?> GetByStripePaymentIntentIdAsync(string intentId);
    Task<SaaS.Domain.Entities.Payment?> GetByStripeSessionIdAsync(string sessionId);
    Task<SaaS.Domain.Entities.Payment?> GetBySubscriptionIdAsync(Guid subscriptionId);
    Task<IEnumerable<SaaS.Domain.Entities.Payment>> GetByTenantIdAsync(long tenantId);
    Task AddAsync(SaaS.Domain.Entities.Payment payment);
    Task DeleteAsync(SaaS.Domain.Entities.Payment payment);
    Task UpdateAsync(SaaS.Domain.Entities.Payment payment);
    Task SaveChangesAsync();
    Task<(IEnumerable<SaaS.Domain.Entities.Payment> Items, int TotalCount)> GetPaginatedPaymentsAsync(long tenantId, string? searchTerm, SaaS.Domain.Enums.PaymentStatus? status, string? sortColumn, string? sortOrder, int pageNumber, int pageSize);
    Task<(IEnumerable<SaaS.Domain.Entities.Payment> Items, int TotalCount)> GetPaginatedInvoicesAsync(long tenantId, string? searchTerm, string? sortColumn, string? sortOrder, int pageNumber, int pageSize);
    Task<SaaS.Domain.Entities.Payment?> GetPaymentForInvoiceAsync(Guid paymentId);
}

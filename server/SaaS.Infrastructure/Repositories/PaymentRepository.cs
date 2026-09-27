using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment?> GetByStripeSessionIdAsync(string sessionId)
    {
        return await _context.Payments
            .FirstOrDefaultAsync(p => p.StripeCheckoutSessionId == sessionId);
    }

    public async Task<IEnumerable<Payment>> GetByTenantIdAsync(long tenantId)
    {
        return await _context.Payments
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Plan)
            .Where(p => p.TenantId == tenantId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
    }

    public Task DeleteAsync(Payment payment)
    {
        _context.Payments.Remove(payment);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<(IEnumerable<Payment> Items, int TotalCount)> GetPaginatedPaymentsAsync(long tenantId, string? searchTerm, SaaS.Domain.Enums.PaymentStatus? status, string? sortColumn, string? sortOrder, int pageNumber, int pageSize)
    {
        var query = _context.Payments
            .Include(p => p.Subscription)
            .ThenInclude(s => s.Plan)
            .Where(p => p.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearchTerm = searchTerm.ToLower();
            query = query.Where(p => 
                (p.Subscription.Plan.Name != null && p.Subscription.Plan.Name.ToLower().Contains(lowerSearchTerm)) ||
                (p.StripeInvoiceId != null && p.StripeInvoiceId.ToLower().Contains(lowerSearchTerm))
            );
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        if (!string.IsNullOrWhiteSpace(sortColumn))
        {
            bool isDesc = sortOrder?.ToLower() == "desc";
            query = sortColumn.ToLower() switch
            {
                "amount" => isDesc ? query.OrderByDescending(p => p.Amount) : query.OrderBy(p => p.Amount),
                "paymentdate" => isDesc ? query.OrderByDescending(p => p.PaymentDate) : query.OrderBy(p => p.PaymentDate),
                "status" => isDesc ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
                "planname" => isDesc ? query.OrderByDescending(p => p.Subscription.Plan.Name) : query.OrderBy(p => p.Subscription.Plan.Name),
                _ => isDesc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
            };
        }
        else
        {
            query = query.OrderByDescending(p => p.CreatedAt);
        }

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}

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
}

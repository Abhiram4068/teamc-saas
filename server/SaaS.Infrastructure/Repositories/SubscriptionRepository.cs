using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly AppDbContext _context;

    public SubscriptionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetByIdAsync(Guid id)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Subscription?> GetByTenantIdAsync(int tenantId)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId);
    }

    public async Task<Subscription?> GetActiveByTenantIdAsync(int tenantId)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active);
    }

    public async Task<Subscription?> GetScheduledByTenantIdAsync(int tenantId)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Scheduled);
    }

    public async Task<IEnumerable<Subscription>> GetPendingSubscriptionsByTenantIdAsync(int tenantId)
    {
        return await _context.Subscriptions
            .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Pending)
            .ToListAsync();
    }

    public async Task<Subscription?> GetActiveSubscriptionWithFeaturesAsync(int tenantId)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .ThenInclude(p => p.PlanFeatures)
            .ThenInclude(pf => pf.Feature)
            .Include(s => s.Plan)
            .ThenInclude(p => p.PlanFeatures)
            .ThenInclude(pf => pf.Config)
            .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active && s.Plan.Status == PlanStatus.Active)
            .FirstOrDefaultAsync();
    }

    public async Task AddAsync(Subscription subscription)
    {
        await _context.Subscriptions.AddAsync(subscription);
    }

    public Task DeleteAsync(Subscription subscription)
    {
        _context.Subscriptions.Remove(subscription);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Subscription subscription)
    {
        _context.Subscriptions.Update(subscription);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

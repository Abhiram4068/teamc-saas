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

    public async Task<Subscription?> GetByTenantIdAsync(int tenantId)
    {
        return await _context.Subscriptions
            .Include(s => s.Plan)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active);
    }
}

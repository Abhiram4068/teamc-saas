using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class PlanFeatureRepository : IPlanFeatureRepository
{
    private readonly AppDbContext _context;

    public PlanFeatureRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(int planId, int featureId)
    {
        return await _context.PlanFeatures
            .AnyAsync(pf => pf.PlanId == planId && pf.FeatureId == featureId);
    }

    public async Task<List<int>> GetExistingFeatureIdsAsync(int planId, IEnumerable<int> featureIds)
    {
        return await _context.PlanFeatures
            .Where(pf => pf.PlanId == planId && featureIds.Contains(pf.FeatureId))
            .Select(pf => pf.FeatureId)
            .ToListAsync();
    }

    public async Task<PlanFeature?> GetAsync(int planId, int featureId)
    {
        return await _context.PlanFeatures
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .FirstOrDefaultAsync(pf => pf.PlanId == planId && pf.FeatureId == featureId);
    }

    public async Task<IEnumerable<PlanFeature>> GetByPlanIdAsync(int planId)
    {
        return await _context.PlanFeatures
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .Where(pf => pf.PlanId == planId)
            .OrderBy(pf => pf.Feature.Name)
            .ToListAsync();
    }

    public async Task AddAsync(PlanFeature planFeature)
    {
        await _context.PlanFeatures.AddAsync(planFeature);
    }

    public async Task AddRangeAsync(IEnumerable<PlanFeature> planFeatures)
    {
        await _context.PlanFeatures.AddRangeAsync(planFeatures);
    }

    public Task RemoveAsync(PlanFeature planFeature)
    {
        _context.PlanFeatures.Remove(planFeature);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

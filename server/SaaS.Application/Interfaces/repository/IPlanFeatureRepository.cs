using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IPlanFeatureRepository
{
    Task<bool> ExistsAsync(int planId, int featureId);
    Task<List<int>> GetExistingFeatureIdsAsync(int planId, IEnumerable<int> featureIds);
    Task<PlanFeature?> GetAsync(int planId, int featureId);
    Task<IEnumerable<PlanFeature>> GetByPlanIdAsync(int planId);
    Task AddAsync(PlanFeature planFeature);
    Task AddRangeAsync(IEnumerable<PlanFeature> planFeatures);
    Task RemoveAsync(PlanFeature planFeature);
    Task SaveChangesAsync();
}

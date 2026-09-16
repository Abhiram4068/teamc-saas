using SaaS.Application.Interfaces.Features;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services.Features;

public class TenantFeatureService : ITenantFeatureService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IUserRepository _userRepository;

    public TenantFeatureService(ISubscriptionRepository subscriptionRepository, IUserRepository userRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
    }

    public async Task<bool> HasFeatureAsync(int tenantId, string featureCode)
    {
        var subscription = await _subscriptionRepository.GetActiveSubscriptionWithFeaturesAsync(tenantId);

        if (subscription == null || subscription.Plan == null)
        {
            return false;
        }

        var feature = subscription.Plan.PlanFeatures
            .FirstOrDefault(pf => pf.Feature != null && pf.Feature.Code == featureCode && pf.IsEnabled && pf.Feature.Status == FeatureStatus.Active);

        if (feature == null)
            return false;

        // If it's an AccessBased feature, check the Config's AccessValue
        if (feature.Feature.Type == FeatureType.AccessBased)
        {
            return feature.Config?.AccessValue == true;
        }

        return true;
    }

    public async Task<int?> GetFeatureLimitAsync(int tenantId, string featureCode)
    {
        var subscription = await _subscriptionRepository.GetActiveSubscriptionWithFeaturesAsync(tenantId);

        if (subscription == null || subscription.Plan == null)
        {
            return null;
        }

        var feature = subscription.Plan.PlanFeatures
            .FirstOrDefault(pf => pf.Feature != null && pf.Feature.Code == featureCode && pf.IsEnabled && pf.Feature.Status == FeatureStatus.Active);

        if (feature == null || feature.Feature.Type != FeatureType.LimitBased)
        {
            return null;
        }

        return feature.Config?.LimitValue;
    }

    public async Task<int> GetCurrentAdminCountAsync(int tenantId)
    {
        // Role 2 is usually Admin, Role 1 is SuperAdmin, Role 3 is User. Assuming 2 based on previous usage in BillingController
        return await _userRepository.GetCountByRoleAsync(tenantId);
    }
}

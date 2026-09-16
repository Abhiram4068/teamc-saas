namespace SaaS.Application.Interfaces.Features;

public interface ITenantFeatureService
{
    Task<bool> HasFeatureAsync(int tenantId, string featureCode);
    Task<int?> GetFeatureLimitAsync(int tenantId, string featureCode);
    Task<int> GetCurrentAdminCountAsync(int tenantId);
}

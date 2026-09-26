using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class TenantService : ITenantService
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public TenantService(ITenantRepository tenantRepository, ISubscriptionRepository subscriptionRepository)
    {
        _tenantRepository = tenantRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<PagedResponseDto<TenantListResponseDto>> GetTenantsPaginatedAsync(TenantQueryRequestDto query)
    {
        var (tenants, totalCount) = await _tenantRepository.GetPaginatedTenantsAsync(query);

        var data = tenants.Select(t =>
        {
            var primaryContact = t.Users.FirstOrDefault(u => u.Role == Role.Tenant);

            return new TenantListResponseDto
            {
                Id = t.Id,
                CompanyName = t.CompanyName,
                CIN = t.CIN,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                FirstName = primaryContact?.FirstName ?? string.Empty,
                LastName = primaryContact?.LastName ?? string.Empty,
                Email = primaryContact?.Email ?? string.Empty,
                PhoneNumber = primaryContact?.PhoneNumber
            };
        });

        return new PagedResponseDto<TenantListResponseDto>
        {
            Data = data,
            TotalRecords = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }

    public async Task<SaaS.Application.DTOs.Common.ApiResponse<TenantFeaturesResponseDto>> GetTenantFeaturesAsync(int tenantId)
    {
        var subscription = await _subscriptionRepository.GetActiveSubscriptionWithFeaturesAsync(tenantId);

        if (subscription == null || subscription.Plan == null)
        {
            return SaaS.Application.DTOs.Common.ApiResponse<TenantFeaturesResponseDto>.FailureResponse("No active subscription found.", 404);
        }

        var responseDto = new TenantFeaturesResponseDto
        {
            Plan = new PlanSummaryDto
            {
                Id = subscription.Plan.Id,
                Name = subscription.Plan.Name
            },
            Features = subscription.Plan.PlanFeatures.Select(pf => new FeatureSummaryDto
            {
                Code = pf.Feature?.Code ?? string.Empty,
                Type = pf.Feature?.Type.ToString() ?? string.Empty,
                Enabled = pf.IsEnabled,
                Limit = pf.Config?.LimitValue
            }).ToList()
        };

        return SaaS.Application.DTOs.Common.ApiResponse<TenantFeaturesResponseDto>.SuccessResponse(responseDto, "Features retrieved successfully.", 200);
    }
}

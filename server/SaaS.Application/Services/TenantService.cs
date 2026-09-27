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
    private readonly IUserRepository _userRepository;

    public TenantService(ITenantRepository tenantRepository, ISubscriptionRepository subscriptionRepository, IUserRepository userRepository)
    {
        _tenantRepository = tenantRepository;
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
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

    public async Task<SaaS.Application.DTOs.Common.ApiResponse<TenantDashboardDto>> GetTenantDashboardAsync(long tenantId)
    {
        var adminsCount = await _userRepository.GetCountByRoleAsync(tenantId);
        
        var subscription = await _subscriptionRepository.GetActiveSubscriptionWithFeaturesAsync((int)tenantId);
        
        string currentPlan = "No Active Plan";
        string nextPayment = "N/A";

        if (subscription != null && subscription.Plan != null)
        {
            currentPlan = subscription.Plan.Name;
            
            if (currentPlan.Contains("Free", StringComparison.OrdinalIgnoreCase))
            {
                nextPayment = "N/A";
            }
            else
            {
                nextPayment = subscription.EndDate?.ToString("MMM dd, yyyy") ?? "N/A";
            }
        }

        var dashboardData = new TenantDashboardDto
        {
            TotalAdmins = adminsCount,
            CurrentActivePlan = currentPlan,
            NextPaymentDate = nextPayment
        };

        return SaaS.Application.DTOs.Common.ApiResponse<TenantDashboardDto>.SuccessResponse(dashboardData, "Dashboard metrics retrieved successfully.", 200);
    }
}

using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Application.Services;

public class SuperAdminDashboardService : ISuperAdminDashboardService
{
    private readonly ISuperAdminDashboardRepository _dashboardRepository;

    public SuperAdminDashboardService(ISuperAdminDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<ApiResponse<SuperAdminDashboardDto>> GetDashboardAsync()
    {
        var data = await _dashboardRepository.GetDashboardDataAsync();
        return ApiResponse<SuperAdminDashboardDto>.SuccessResponse(data, "Dashboard data retrieved successfully");
    }
}

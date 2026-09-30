using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface ISuperAdminDashboardService
{
    Task<ApiResponse<SuperAdminDashboardDto>> GetDashboardAsync();
}

using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Repository;

public interface ISuperAdminDashboardRepository
{
    Task<SuperAdminDashboardDto> GetDashboardDataAsync();
}

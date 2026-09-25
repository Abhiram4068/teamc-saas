using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.DTOs.Common;

namespace SaaS.Application.Interfaces.Service;

public interface ITenantEmployeeService
{
    Task<ApiResponse<string>> CreateEmployeeAsync(int tenantId, CreateEmployeeRequestDto request);
    Task<ApiResponse<PagedResponseDto<EmployeeResponseDto>>> GetEmployeesAsync(int tenantId, long userId, SaaS.Domain.Enums.Role role, GetEmployeesRequestDto request);
    Task<ApiResponse<EmployeeDashboardSummaryDto>> GetDashboardSummaryAsync(int tenantId, long userId, SaaS.Domain.Enums.Role role);
    Task<ApiResponse<EmployeeDetailedResponseDto>> GetEmployeeByIdAsync(int tenantId, long employeeId, long currentUserId, SaaS.Domain.Enums.Role role);
    Task<ApiResponse<string>> UpdateEmployeeProfileAsync(int tenantId, long employeeId, UpdateEmployeeProfileRequestDto request);
    Task<ApiResponse<string>> UpdateUserStatusAsync(int tenantId, long employeeId, UpdateUserStatusRequestDto request);
    Task<ApiResponse<string>> DeleteEmployeeAsync(int tenantId, long employeeId, DeleteUserRequestDto request);
    Task<ApiResponse<string>> UpdateReportingManagerAsync(int tenantId, long employeeId, UpdateReportingManagerRequestDto request);
    Task<ApiResponse<IEnumerable<EmployeeResponseDto>>> GetManagersAsync(int tenantId, string? search);
}

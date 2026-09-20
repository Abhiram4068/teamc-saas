using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.DTOs.Common;

namespace SaaS.Application.Interfaces.Service;

public interface ITenantEmployeeService
{
    Task<ApiResponse<string>> CreateEmployeeAsync(int tenantId, CreateEmployeeRequestDto request);
    Task<ApiResponse<PagedResponseDto<EmployeeResponseDto>>> GetEmployeesAsync(int tenantId, GetEmployeesRequestDto request);
}

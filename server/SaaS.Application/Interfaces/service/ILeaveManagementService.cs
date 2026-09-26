using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface ILeaveManagementService
{
    Task<ApiResponse<PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>>> GetLeaveBalancesAsync(long tenantId, LeaveBalanceQueryRequestDto query);
    Task<ApiResponse<EmployeeLeaveBalancesResponseDto>> GetMyLeaveBalancesAsync(long tenantId, long userId);
    Task<ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>> GetMyLeaveRequestsAsync(long tenantId, long userId, LeaveRequestQueryDto query);
    Task<ApiResponse<string>> CancelLeaveRequestAsync(long tenantId, long userId, int requestId);
    Task<ApiResponse<PaginatedResponseDto<TeamLeaveRequestResponseDto>>> GetTeamLeaveRequestsAsync(long tenantId, long managerUserId, LeaveRequestQueryDto query);
    Task<ApiResponse<string>> ApproveLeaveRequestAsync(long tenantId, long managerUserId, int requestId, string? comment);
    Task<ApiResponse<string>> RejectLeaveRequestAsync(long tenantId, long managerUserId, int requestId, string? comment);
    Task<ApiResponse<string>> SubmitLeaveRequestAsync(long tenantId, long userId, SubmitLeaveRequestDto request);
    Task<ApiResponse<string>> AllocateLeaveAsync(long tenantId, AllocateLeaveRequestDto request);
    Task<ApiResponse<string>> UpdateLeaveBalanceAsync(long tenantId, int balanceId, UpdateLeaveBalanceRequestDto request);

    // Leave Type CRUD
    Task<ApiResponse<IEnumerable<LeaveTypeResponseDto>>> GetLeaveTypesAsync(long tenantId);
    Task<ApiResponse<string>> CreateLeaveTypeAsync(long tenantId, CreateLeaveTypeRequestDto request);
    Task<ApiResponse<string>> UpdateLeaveTypeAsync(long tenantId, int id, UpdateLeaveTypeRequestDto request);
    Task<ApiResponse<string>> DeleteLeaveTypeAsync(long tenantId, int id);
}

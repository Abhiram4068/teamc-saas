using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IWorkReportService
{
    // Work Reports
    Task<ApiResponse<PagedResponseDto<GroupedWorkReportDto>>> GetMyReportsAsync(long tenantId, long userId, WorkReportQueryRequestDto request);
    Task<ApiResponse<bool>> CheckReportSubmittedAsync(long tenantId, long userId, DateTime date);
    Task<ApiResponse<PagedResponseDto<GroupedWorkReportDto>>> GetTeamReportsAsync(long tenantId, long userId, WorkReportQueryRequestDto request);
    Task<ApiResponse<IEnumerable<WorkReportDto>>> CreateReportsAsync(long tenantId, long userId, IEnumerable<CreateWorkReportDto> dtos);
    Task<ApiResponse<WorkReportDto>> UpdateReportAsync(long tenantId, long userId, long id, UpdateWorkReportDto dto);

    // Work Types
    Task<ApiResponse<IEnumerable<WorkTypeDto>>> GetWorkTypesAsync(long tenantId);
    Task<ApiResponse<CreateWorkTypeResponseDto>> CreateWorkTypeAsync(long tenantId, CreateWorkTypeDto request);
    Task<ApiResponse<string>> UpdateWorkTypeAsync(long tenantId, int id, CreateWorkTypeDto request);
    Task<ApiResponse<string>> DeleteWorkTypeAsync(long tenantId, int id);
}

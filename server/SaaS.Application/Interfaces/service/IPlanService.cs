using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IPlanService
{
    Task<ApiResponse<PlanResponseDto>> CreatePlanAsync(CreatePlanRequestDto request, string? createdBy = null);
    Task<ApiResponse<PlanResponseDto>> GetPlanByIdAsync(int id);
    Task<ApiResponse<PaginatedResponseDto<PlanResponseDto>>> GetPlansAsync(GetPlansRequestDto request);
    Task<ApiResponse<List<PlanFeatureResponseDto>>> MapFeaturesToPlanAsync(MapPlanFeatureRequestDto request);
    Task<ApiResponse<List<PlanFeatureResponseDto>>> GetFeaturesForPlanAsync(int planId);
    Task<ApiResponse<bool>> RemoveFeatureFromPlanAsync(int planId, int featureId);
}

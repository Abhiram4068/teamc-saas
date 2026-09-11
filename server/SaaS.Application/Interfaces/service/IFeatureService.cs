using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

/// <summary>
/// Service interface for business operations on features.
/// </summary>
public interface IFeatureService
{
    Task<ApiResponse<FeatureResponseDto>> CreateFeatureAsync(CreateFeatureRequestDto request, string? createdBy = null);
    Task<ApiResponse<FeatureResponseDto>> GetFeatureByIdAsync(int id);
    Task<ApiResponse<PaginatedResponseDto<FeatureResponseDto>>> GetFeaturesAsync(GetFeaturesRequestDto request);
}

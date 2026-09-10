using FluentValidation;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;

namespace SaaS.Application.Services;

/// <summary>
/// Service implementation handling feature creation and business validation logic.
/// </summary>
public class FeatureService : IFeatureService
{
    private readonly IFeatureRepository _featureRepository;
    private readonly IValidator<CreateFeatureRequestDto> _validator;

    public FeatureService(
        IFeatureRepository featureRepository,
        IValidator<CreateFeatureRequestDto> validator)
    {
        _featureRepository = featureRepository;
        _validator = validator;
    }

    public async Task<ApiResponse<FeatureResponseDto>> CreateFeatureAsync(CreateFeatureRequestDto request, string? createdBy = null)
    {
        // 1. Fluent Validation
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var firstError = validationResult.Errors.First().ErrorMessage;
            return ApiResponse<FeatureResponseDto>.FailureResponse(firstError, 400);
        }

        // 2. Business Validation: Unique Feature Code check
        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var exists = await _featureRepository.ExistsByCodeAsync(normalizedCode);
        if (exists)
        {
            return ApiResponse<FeatureResponseDto>.FailureResponse($"Feature with code '{normalizedCode}' already exists.", 409);
        }

        // Capitalize the first letter of each word
        var words = request.Name.Trim().ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var formattedName = string.Join(" ", words.Select(w => char.ToUpper(w[0]) + w.Substring(1)));

        // 3. Map DTO to Entity
        var feature = new Feature
        {
            Name = formattedName,
            Code = normalizedCode,
            Description = request.Description?.Trim(),
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        // 4. Persistence via Repository
        await _featureRepository.AddAsync(feature);
        await _featureRepository.SaveChangesAsync();

        // 5. Map to Response DTO
        var responseDto = new FeatureResponseDto
        {
            Id = feature.Id,
            Name = formattedName,
            Code = feature.Code,
            Description = feature.Description,
            Status = feature.Status,
            CreatedAt = feature.CreatedAt,
            CreatedBy = feature.CreatedBy,
            UpdatedAt = feature.UpdatedAt
        };

        return ApiResponse<FeatureResponseDto>.SuccessResponse(responseDto, "Feature created successfully.", 201);
    }

    public async Task<ApiResponse<FeatureResponseDto>> GetFeatureByIdAsync(int id)
    {
        var feature = await _featureRepository.GetByIdAsync(id);
        if (feature == null)
        {
            return ApiResponse<FeatureResponseDto>.FailureResponse($"Feature with ID {id} not found.", 404);
        }

        var responseDto = new FeatureResponseDto
        {
            Id = feature.Id,
            Name = feature.Name,
            Code = feature.Code,
            Description = feature.Description,
            Status = feature.Status,
            CreatedAt = feature.CreatedAt,
            CreatedBy = feature.CreatedBy,
            UpdatedAt = feature.UpdatedAt
        };

        return ApiResponse<FeatureResponseDto>.SuccessResponse(responseDto, "Feature retrieved successfully.", 200);
    }

    public async Task<ApiResponse<PaginatedResponseDto<FeatureResponseDto>>> GetFeaturesAsync(GetFeaturesRequestDto request)
    {
        var (items, totalCount) = await _featureRepository.GetFeaturesAsync(request.SearchTerm,request.Status,request.PageNumber,request.PageSize);

        if (!items.Any())
        {
            return ApiResponse<PaginatedResponseDto<FeatureResponseDto>>.SuccessResponse(
                new PaginatedResponseDto<FeatureResponseDto>(), 
                "No features exist.", 
                200);
        }

        var responseDtos = items.Select(feature => new FeatureResponseDto
        {
            Id = feature.Id,
            Name = feature.Name,
            Code = feature.Code,
            Description = feature.Description,
            Status = feature.Status,
            CreatedAt = feature.CreatedAt,
            CreatedBy = feature.CreatedBy,
            UpdatedAt = feature.UpdatedAt
        }).ToList();

        var paginatedResponse = new PaginatedResponseDto<FeatureResponseDto>
        {
            Items = responseDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return ApiResponse<PaginatedResponseDto<FeatureResponseDto>>.SuccessResponse(paginatedResponse, "Features retrieved successfully.", 200);
    }
}

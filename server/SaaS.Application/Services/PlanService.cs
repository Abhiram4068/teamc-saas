using FluentValidation;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;

namespace SaaS.Application.Services;

public class PlanService : IPlanService
{
    private readonly IPlanRepository _planRepository;
    private readonly IFeatureRepository _featureRepository;
    private readonly IPlanFeatureRepository _planFeatureRepository;
    private readonly IValidator<CreatePlanRequestDto> _validator;
    private readonly IValidator<MapPlanFeatureRequestDto> _mapValidator;

    public PlanService(
        IPlanRepository planRepository,
        IFeatureRepository featureRepository,
        IPlanFeatureRepository planFeatureRepository,
        IValidator<CreatePlanRequestDto> validator,
        IValidator<MapPlanFeatureRequestDto> mapValidator)
    {
        _planRepository = planRepository;
        _featureRepository = featureRepository;
        _planFeatureRepository = planFeatureRepository;
        _validator = validator;
        _mapValidator = mapValidator;
    }

    public async Task<ApiResponse<PlanResponseDto>> CreatePlanAsync(CreatePlanRequestDto request, string? createdBy = null)
    {
        // 1. Fluent Validation
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var firstError = validationResult.Errors.First().ErrorMessage;
            return ApiResponse<PlanResponseDto>.FailureResponse(firstError, 400);
        }

        // 2. Business Validation: Unique Plan Code & Name check
        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        if (await _planRepository.ExistsByCodeAsync(normalizedCode))
        {
            return ApiResponse<PlanResponseDto>.FailureResponse($"Plan with code {normalizedCode} already exists.", 409);
        }

        var normalizedName = request.Name.Trim();
        if (await _planRepository.ExistsByNameAsync(normalizedName))
        {
            return ApiResponse<PlanResponseDto>.FailureResponse($"Plan with name {normalizedName} already exists.", 409);
        }

        // Format Name (Title Case)
        var words = normalizedName.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var formattedName = string.Join(" ", words.Select(w => char.ToUpper(w[0]) + w.Substring(1)));

        // 3. Map DTO to Entity
        var plan = new Plan
        {
            Name = formattedName,
            Code = normalizedCode,
            Description = request.Description?.Trim(),
            Status = request.Status,
            MonthlyPrice = request.MonthlyPrice,
            YearlyPrice = request.YearlyPrice,
            Currency = request.Currency,
            TrialPeriodDays = request.TrialPeriodDays,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            Version = 1
        };

        // 4. Persistence via Repository
        await _planRepository.AddAsync(plan);
        await _planRepository.SaveChangesAsync();

        // 5. Map to Response DTO
        var responseDto = MapToDto(plan);

        return ApiResponse<PlanResponseDto>.SuccessResponse(responseDto, "Plan created successfully.", 201);
    }

    public async Task<ApiResponse<PlanResponseDto>> GetPlanByIdAsync(int id, int? role = null)
    {
        var plan = await _planRepository.GetByIdAsync(id);
        if (plan == null)
        {
            return ApiResponse<PlanResponseDto>.FailureResponse($"Plan with ID {id} not found.", 404);
        }

        if (role == 2 && (int)plan.Status != 1)
        {
            return ApiResponse<PlanResponseDto>.FailureResponse($"Plan not found..", 404);
        }

        return ApiResponse<PlanResponseDto>.SuccessResponse(MapToDto(plan), "Plan retrieved successfully.", 200);
    }

    public async Task<ApiResponse<PaginatedResponseDto<PlanResponseDto>>> GetPlansAsync(GetPlansRequestDto request)
    {
        var (items, totalCount) = await _planRepository.GetPlansAsync(request.SearchTerm, request.Status, request.PageNumber, request.PageSize);

        if (!items.Any())
        {
            return ApiResponse<PaginatedResponseDto<PlanResponseDto>>.SuccessResponse(
                new PaginatedResponseDto<PlanResponseDto>(), 
                "No plans exist.", 
                200);
        }

        var responseDtos = items.Select(MapToDto).ToList();

        var paginatedResponse = new PaginatedResponseDto<PlanResponseDto>
        {
            Items = responseDtos,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return ApiResponse<PaginatedResponseDto<PlanResponseDto>>.SuccessResponse(paginatedResponse, "Plans retrieved successfully.", 200);
    }

    public async Task<ApiResponse<List<PlanFeatureResponseDto>>> MapFeaturesToPlanAsync(MapPlanFeatureRequestDto request)
    {
        // Fluent Validation
        var validationResult = await _mapValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var firstError = validationResult.Errors.First().ErrorMessage;
            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse(firstError, 400);
        }

        var planId = request.PlanId;
        var featureIds = request.FeatureIds.Distinct().ToList();

        if (!featureIds.Any())
        {
            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse("At least one Feature ID must be provided.", 400);
        }

        // Validate Plan Existence (Single DB Query)
        var plan = await _planRepository.GetByIdAsync(planId);
        if (plan == null)
        {
            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse($"Plan with ID {planId} not found.", 404);
        }

        // Calls the repo function to get the features by their IDs and
        // returns even though any of the feature with the given ID does not exist
        var features = await _featureRepository.GetByIdsAsync(featureIds);

        // Retrieves the IDs from the list of objects and stores them in a HashSet for efficient lookup
        var foundFeatureIds = features.Select(f => f.Id).ToHashSet();

        // Compares the provided feature IDs with the found feature IDs to identify any missing IDs
        var missingIds = featureIds.Where(id => !foundFeatureIds.Contains(id)).ToList();

        if (missingIds.Any())
        {
            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse(
                $"The following feature ID(s) do not exist: {string.Join(", ", missingIds)}.",
                404);
        }

        // Returns rhe feature ids that have already been mapped to the plan
        var existingMappedFeatureIds = await _planFeatureRepository.GetExistingFeatureIdsAsync(planId, featureIds);

        // If it does returns IDs
        if (existingMappedFeatureIds.Any())
        {
            // Create a list of existing feature names for the error message
            var existingNames = features
                .Where(f => existingMappedFeatureIds.Contains(f.Id))
                .Select(f => $"'{f.Name}' (ID: {f.Id})");

            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse(
                $"Feature(s) already mapped to Plan '{plan.Name}': {string.Join(", ", existingNames)}.",
                409);
        }

        // Store the records in C# objects 
        var newPlanFeatures = featureIds.Select(featureId => new PlanFeature
        {
            PlanId = planId,
            FeatureId = featureId,
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        // Persist the new mappings to the database
        await _planFeatureRepository.AddRangeAsync(newPlanFeatures);
        await _planFeatureRepository.SaveChangesAsync();

        var featureLookup = features.ToDictionary(f => f.Id);

        var responseDtos = newPlanFeatures.Select(pf =>
        {
            var feature = featureLookup[pf.FeatureId];
            return new PlanFeatureResponseDto
            {
                Id = pf.Id,                    
                PlanId = pf.PlanId,
                PlanName = plan.Name,
                PlanCode = plan.Code,
                FeatureId = pf.FeatureId,
                FeatureName = feature.Name,
                FeatureCode = feature.Code,
                FeatureDescription = feature.Description,
                IsEnabled = pf.IsEnabled,
                CreatedAt = pf.CreatedAt,
                TotalFeatures = existingMappedFeatureIds.Count + newPlanFeatures.Count
            };
        }).ToList();

        return ApiResponse<List<PlanFeatureResponseDto>>.SuccessResponse(
            responseDtos,
            $"{newPlanFeatures.Count} feature(s) successfully mapped to plan '{plan.Name}'.",
            201);
    }

    public async Task<ApiResponse<List<PlanFeatureResponseDto>>> GetFeaturesForPlanAsync(int planId, int? role = null)
    {
        var plan = await _planRepository.GetByIdAsync(planId);
        if (plan == null)
        {
            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse($"Plan with ID {planId} not found.", 404);
        }

        if (role == 2 && (int)plan.Status != 1)
        {
            return ApiResponse<List<PlanFeatureResponseDto>>.FailureResponse($"Plan not found..", 404);
        }

        var planFeatures = await _planFeatureRepository.GetByPlanIdAsync(planId);
        var totalCount = planFeatures.Count();
        var responseDtos = planFeatures.Select(pf => new PlanFeatureResponseDto
        {
            Id = pf.Id,
            PlanId = pf.PlanId,
            PlanName = pf.Plan?.Name ?? plan.Name,
            PlanCode = pf.Plan?.Code ?? plan.Code,
            FeatureId = pf.FeatureId,
            FeatureName = pf.Feature?.Name ?? string.Empty,
            FeatureCode = pf.Feature?.Code ?? string.Empty,
            FeatureDescription = pf.Feature?.Description,
            IsEnabled = pf.IsEnabled,
            CreatedAt = pf.CreatedAt,
            TotalFeatures = totalCount
        }).ToList();

        return ApiResponse<List<PlanFeatureResponseDto>>.SuccessResponse(responseDtos, "Plan features retrieved successfully.", 200);
    }

    public async Task<ApiResponse<bool>> RemoveFeatureFromPlanAsync(int planId, int featureId)
    {
        var mapping = await _planFeatureRepository.GetAsync(planId, featureId);
        if (mapping == null)
        {
            return ApiResponse<bool>.FailureResponse($"Feature with ID {featureId} is not mapped to Plan with ID {planId}.", 404);
        }

        await _planFeatureRepository.RemoveAsync(mapping);
        await _planFeatureRepository.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Feature mapping removed successfully.", 200);
    }

    public async Task<ApiResponse<List<PublicPlanResponseDto>>> PublicPlanGetAsync()
    {
        var plans = await _planRepository.GetActivePublicPlansAsync();

        var responseDtos = plans.Select(plan => new PublicPlanResponseDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Code = plan.Code,
            Description = plan.Description,
            MonthlyPrice = plan.MonthlyPrice,
            YearlyPrice = plan.YearlyPrice,
            Currency = plan.Currency,
            TrialPeriodDays = plan.TrialPeriodDays,
            Features = plan.PlanFeatures
                .Where(pf => pf.IsEnabled && pf.Feature != null)
                .OrderBy(pf => pf.Feature.Name)
                .Select(pf => new PublicPlanFeatureDto
                {
                    Id = pf.Id,
                    FeatureId = pf.FeatureId,
                    Name = pf.Feature.Name,
                    Description = pf.Feature.Description,
                    IsEnabled = pf.IsEnabled
                }).ToList()
        }).ToList();

        return ApiResponse<List<PublicPlanResponseDto>>.SuccessResponse(
            responseDtos,
            "Public plans retrieved successfully.",
            200);
    }

    private static PlanResponseDto MapToDto(Plan plan)
    {
        return new PlanResponseDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Code = plan.Code,
            Description = plan.Description,
            Status = plan.Status,
            MonthlyPrice = plan.MonthlyPrice,
            YearlyPrice = plan.YearlyPrice,
            Currency = plan.Currency,
            TrialPeriodDays = plan.TrialPeriodDays,
            Version = plan.Version,
            EffectiveFrom = plan.EffectiveFrom,
            EffectiveTo = plan.EffectiveTo,
            CreatedAt = plan.CreatedAt,
            CreatedBy = plan.CreatedBy,
            UpdatedAt = plan.UpdatedAt,
            FeatureCount = plan.PlanFeatures?.Count ?? 0
        };
    }
}

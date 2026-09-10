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
    private readonly IValidator<CreatePlanRequestDto> _validator;

    public PlanService(
        IPlanRepository planRepository,
        IValidator<CreatePlanRequestDto> validator)
    {
        _planRepository = planRepository;
        _validator = validator;
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

    public async Task<ApiResponse<PlanResponseDto>> GetPlanByIdAsync(int id)
    {
        var plan = await _planRepository.GetByIdAsync(id);
        if (plan == null)
        {
            return ApiResponse<PlanResponseDto>.FailureResponse($"Plan with ID {id} not found.", 404);
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
            UpdatedAt = plan.UpdatedAt
        };
    }
}

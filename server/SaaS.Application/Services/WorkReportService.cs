using Microsoft.Extensions.Logging;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class WorkReportService : IWorkReportService
{
    private readonly IWorkReportRepository _workReportRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILogger<WorkReportService> _logger;

    public WorkReportService(
        IWorkReportRepository workReportRepository,
        IEmployeeRepository employeeRepository,
        ILogger<WorkReportService> logger)
    {
        _workReportRepository = workReportRepository;
        _employeeRepository = employeeRepository;
        _logger = logger;
    }

    private WorkReportDto MapToDto(WorkReport report)
    {
        return new WorkReportDto
        {
            Id = report.Id,
            UserId = report.UserId,
            Name = report.Name,
            Description = report.Description,
            WorkDate = report.WorkDate,
            HoursSpent = report.HoursSpent,
            Status = report.Status,
            WorkType = report.WorkType != null ? new WorkTypeDto
            {
                Id = report.WorkType.Id,
                Name = report.WorkType.Name,
                Description = report.WorkType.Description,
                IsActive = report.WorkType.IsActive
            } : null!
        };
    }

    // --- Work Reports ---

    public async Task<ApiResponse<PagedResponseDto<GroupedWorkReportDto>>> GetMyReportsAsync(long tenantId, long userId, WorkReportQueryRequestDto request)
    {
        try
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null || employee.TenantId != tenantId)
            {
                return ApiResponse<PagedResponseDto<GroupedWorkReportDto>>.FailureResponse("Employee not found.", 404);
            }

            var (items, totalCount) = await _workReportRepository.GetByUserIdAsync(userId, tenantId, request);
            var dtos = items.Select(MapToDto);
            
            var grouped = dtos.GroupBy(r => r.WorkDate.ToString("yyyy-MM-dd"))
                .Select(g => new GroupedWorkReportDto
                {
                    Date = g.Key,
                    TotalHours = g.Sum(r => r.HoursSpent),
                    Status = g.First().Status,
                    Reports = g.ToList()
                })
                .ToList();
            
            var pagedResponse = new PagedResponseDto<GroupedWorkReportDto>
            {
                Data = grouped,
                TotalRecords = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
            
            return ApiResponse<PagedResponseDto<GroupedWorkReportDto>>.SuccessResponse(pagedResponse, "My work reports retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting work reports for User {UserId} in Tenant {TenantId}", userId, tenantId);
            return ApiResponse<PagedResponseDto<GroupedWorkReportDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<bool>> CheckReportSubmittedAsync(long tenantId, long userId, DateTime date)
    {
        try
        {
            var hasSubmitted = await _workReportRepository.HasSubmittedReportAsync(userId, tenantId, date);
            return ApiResponse<bool>.SuccessResponse(hasSubmitted, "Check successful.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking report status for User {UserId} in Tenant {TenantId}", userId, tenantId);
            return ApiResponse<bool>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<PagedResponseDto<GroupedWorkReportDto>>> GetTeamReportsAsync(long tenantId, long userId, WorkReportQueryRequestDto request)
    {
        try
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null || employee.TenantId != tenantId || employee.User.Role != Role.Manager)
            {
                return ApiResponse<PagedResponseDto<GroupedWorkReportDto>>.FailureResponse("Employee not found.", 404);
            }

            var (items, totalCount) = await _workReportRepository.GetTeamReportsAsync(userId, tenantId, request);
            var dtos = items.Select(MapToDto);
            
            var grouped = dtos.GroupBy(r => r.WorkDate.ToString("yyyy-MM-dd"))
                .Select(g => new GroupedWorkReportDto
                {
                    Date = g.Key,
                    TotalHours = g.Sum(r => r.HoursSpent),
                    Status = g.First().Status,
                    Reports = g.ToList()
                })
                .ToList();
            
            var pagedResponse = new PagedResponseDto<GroupedWorkReportDto>
            {
                Data = grouped,
                TotalRecords = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
            
            return ApiResponse<PagedResponseDto<GroupedWorkReportDto>>.SuccessResponse(pagedResponse, "Team work reports retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting team work reports for Manager {UserId} in Tenant {TenantId}", userId, tenantId);
            return ApiResponse<PagedResponseDto<GroupedWorkReportDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<IEnumerable<WorkReportDto>>> CreateReportsAsync(long tenantId, long userId, IEnumerable<CreateWorkReportDto> dtos)
    {
        try
        {
            if (dtos == null || !dtos.Any())
            {
                return ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse("No reports provided.", 400);
            }

            var uniqueDates = dtos.Select(d => d.WorkDate.Date).Distinct().ToList();
            var today = DateTime.UtcNow.Date;

            foreach (var date in uniqueDates)
            {
                if (date > today)
                {
                    return ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse($"Cannot submit reports for a future date: {date:yyyy-MM-dd}.", 400);
                }

                var hasSubmitted = await _workReportRepository.HasSubmittedReportAsync(userId, tenantId, date);
                if (hasSubmitted)
                {
                    return ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse($"Reports for date {date:yyyy-MM-dd} have already been submitted.", 400);
                }
            }

            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null || employee.TenantId != tenantId)
            {
                return ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse("Employee not found.", 404);
            }

            var activeWorkTypes = await _workReportRepository.GetAllActiveWorkTypesAsync(tenantId);
            var workTypeDict = activeWorkTypes.ToDictionary(w => w.Id);

            var reports = new List<WorkReport>();
            foreach (var dto in dtos)
            {
                if (!workTypeDict.TryGetValue(dto.WorkTypeId, out var workType))
                {
                    return ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse($"Invalid or inactive work type selected for report: {dto.Name}.", 400);
                }

                reports.Add(new WorkReport
                {
                    TenantId = tenantId,
                    UserId = userId,
                    WorkTypeId = dto.WorkTypeId,
                    Name = dto.Name,
                    Description = dto.Description,
                    WorkDate = dto.WorkDate,
                    HoursSpent = dto.HoursSpent,
                    Status = dto.Status,
                    CreatedAt = DateTime.UtcNow,
                    WorkType = workType
                });
            }

            await _workReportRepository.AddRangeAsync(reports);
            _logger.LogInformation("Created {Count} WorkReports for User {UserId}", reports.Count, userId);

            var resultDtos = reports.Select(MapToDto);

            return ApiResponse<IEnumerable<WorkReportDto>>.SuccessResponse(resultDtos, "Work reports created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating work reports for User {UserId} in Tenant {TenantId}", userId, tenantId);
            return ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<WorkReportDto>> UpdateReportAsync(long tenantId, long userId, long id, UpdateWorkReportDto dto)
    {
        try
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null || employee.TenantId != tenantId)
            {
                return ApiResponse<WorkReportDto>.FailureResponse("Employee not found.", 404);
            }

            var report = await _workReportRepository.GetByIdAsync(id, tenantId);
            if (report == null || report.UserId != userId)
            {
                return ApiResponse<WorkReportDto>.FailureResponse("Work report not found or unauthorized.", 404);
            }

            if (report.Status == WorkReportStatus.Submitted)
            {
                return ApiResponse<WorkReportDto>.FailureResponse("Submitted reports cannot be edited.", 400);
            }
            
            if (report.WorkTypeId != dto.WorkTypeId)
            {
                var workType = await _workReportRepository.GetWorkTypeByIdAsync(dto.WorkTypeId, tenantId);
                if (workType == null || !workType.IsActive)
                {
                    return ApiResponse<WorkReportDto>.FailureResponse("Invalid or inactive work type selected.", 400);
                }
            }

            report.WorkTypeId = dto.WorkTypeId;
            report.Name = dto.Name;
            report.Description = dto.Description;
            report.WorkDate = dto.WorkDate;
            report.HoursSpent = dto.HoursSpent;
            report.Status = dto.Status;
            report.UpdatedAt = DateTime.UtcNow;

            await _workReportRepository.UpdateAsync(report);
            _logger.LogInformation("WorkReport updated with id: {ReportId} for User {UserId}", report.Id, userId);

            var updatedReport = await _workReportRepository.GetByIdAsync(report.Id, tenantId);
            var resultDto = MapToDto(updatedReport ?? report);

            return ApiResponse<WorkReportDto>.SuccessResponse(resultDto, "Work report updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating work report {ReportId} for User {UserId} in Tenant {TenantId}", id, userId, tenantId);
            return ApiResponse<WorkReportDto>.FailureResponse("An error occurred.", 500);
        }
    }

    // --- Work Types ---

    public async Task<ApiResponse<IEnumerable<WorkTypeDto>>> GetWorkTypesAsync(long tenantId)
    {
        try
        {
            var types = await _workReportRepository.GetAllActiveWorkTypesAsync(tenantId);
            var response = types.Select(t => new WorkTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                IsActive = t.IsActive
            });
            return ApiResponse<IEnumerable<WorkTypeDto>>.SuccessResponse(response, "Work types retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting work types for Tenant {TenantId}", tenantId);
            return ApiResponse<IEnumerable<WorkTypeDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<CreateWorkTypeResponseDto>> CreateWorkTypeAsync(long tenantId, CreateWorkTypeDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ApiResponse<CreateWorkTypeResponseDto>.FailureResponse("Work type name cannot be empty.", 400);
            }

            // Capitalize the first letter
            var capitalizedName = char.ToUpper(request.Name[0]) + request.Name.Substring(1);

            // Check for existing work type
            var existingWorkType = await _workReportRepository.GetWorkTypeByNameAsync(capitalizedName, tenantId);
            if (existingWorkType != null)
            {
                return ApiResponse<CreateWorkTypeResponseDto>.FailureResponse("A work type with this name already exists.", 400);
            }

            var workType = new WorkType
            {
                TenantId = tenantId,
                Name = capitalizedName,
                Description = request.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _workReportRepository.AddWorkTypeAsync(workType);

            var responseDto = new CreateWorkTypeResponseDto
            {
                Id = workType.Id,
                Name = workType.Name,
                Description = workType.Description,
                IsActive = workType.IsActive
            };

            return ApiResponse<CreateWorkTypeResponseDto>.SuccessResponse(responseDto, "Work type created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating work type for Tenant {TenantId}", tenantId);
            return ApiResponse<CreateWorkTypeResponseDto>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> UpdateWorkTypeAsync(long tenantId, int id, CreateWorkTypeDto request)
    {
        try
        {
            var workType = await _workReportRepository.GetWorkTypeByIdAsync(id, tenantId);
            if (workType == null)
            {
                return ApiResponse<string>.FailureResponse("Work type not found.", 404);
            }

            workType.Name = request.Name;
            workType.Description = request.Description;
            workType.UpdatedAt = DateTime.UtcNow;

            await _workReportRepository.UpdateWorkTypeAsync(workType);

            return ApiResponse<string>.SuccessResponse(string.Empty, "Work type updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating work type {Id}", id);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> DeleteWorkTypeAsync(long tenantId, int id)
    {
        try
        {
            var workType = await _workReportRepository.GetWorkTypeByIdAsync(id, tenantId);
            if (workType == null)
            {
                return ApiResponse<string>.FailureResponse("Work type not found.", 404);
            }

            // Soft delete
            workType.IsActive = false;
            workType.UpdatedAt = DateTime.UtcNow;
            
            await _workReportRepository.UpdateWorkTypeAsync(workType);

            return ApiResponse<string>.SuccessResponse(string.Empty, "Work type deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting work type {Id}", id);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Api.Policies.Features;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;
using System.Security.Claims;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequireFeature("WRK_RPRT")]
public class WorkReportController : ControllerBase
{
    private readonly IWorkReportService _workReportService;

    public WorkReportController(IWorkReportService workReportService)
    {
        _workReportService = workReportService;
    }

    // --- Work Reports ---

    [HttpGet]
    [Authorize(Roles = "4,5,6")]
    public async Task<ActionResult<ApiResponse<PagedResponseDto<GroupedWorkReportDto>>>> GetMyReports([FromQuery] WorkReportQueryRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<PagedResponseDto<WorkReportDto>>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _workReportService.GetMyReportsAsync(tenantId, userId, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("check")]
    [Authorize(Roles = "4,5,6")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckReportSubmitted([FromQuery] DateTime date)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<bool>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _workReportService.CheckReportSubmittedAsync(tenantId, userId, date);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("team")]
    [Authorize(Roles = "5")]
    public async Task<ActionResult<ApiResponse<PagedResponseDto<GroupedWorkReportDto>>>> GetTeamReports([FromQuery] WorkReportQueryRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<PagedResponseDto<WorkReportDto>>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _workReportService.GetTeamReportsAsync(tenantId, userId, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    [Authorize(Roles = "4,5,6")]
    public async Task<ActionResult<ApiResponse<IEnumerable<WorkReportDto>>>> CreateReport([FromBody] IEnumerable<CreateWorkReportDto> dtos)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<IEnumerable<WorkReportDto>>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _workReportService.CreateReportsAsync(tenantId, userId, dtos);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "4,5,6")]
    public async Task<ActionResult<ApiResponse<WorkReportDto>>> UpdateReport(long id, [FromBody] UpdateWorkReportDto dto)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<WorkReportDto>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _workReportService.UpdateReportAsync(tenantId, userId, id, dto);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    // --- Work Types ---

    [HttpGet("types")]
    [Authorize(Roles = "3,4,5,6")] // Admin, plus all employees who need to fetch the types for the dropdown
    public async Task<ActionResult<ApiResponse<IEnumerable<WorkTypeDto>>>> GetWorkTypes()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<IEnumerable<WorkTypeDto>>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _workReportService.GetWorkTypesAsync(tenantId);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("types")]
    [Authorize(Roles = "3")] // Only Tenant Admin
    public async Task<ActionResult<ApiResponse<CreateWorkTypeResponseDto>>> CreateWorkType([FromBody] CreateWorkTypeDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<CreateWorkTypeResponseDto>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _workReportService.CreateWorkTypeAsync(tenantId, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("types/{id}")]
    [Authorize(Roles = "3")] // Only Tenant Admin
    public async Task<ActionResult<ApiResponse<string>>> UpdateWorkType(int id, [FromBody] CreateWorkTypeDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _workReportService.UpdateWorkTypeAsync(tenantId, id, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpDelete("types/{id}")]
    [Authorize(Roles = "3")] // Only Tenant Admin
    public async Task<ActionResult<ApiResponse<string>>> DeleteWorkType(int id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _workReportService.DeleteWorkTypeAsync(tenantId, id);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }
}

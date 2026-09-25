using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Api.Policies.Features;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[RequireFeature("LVE_MNGMT")]
public class LeaveController : ControllerBase
{
    private readonly ILeaveManagementService _leaveManagementService;

    public LeaveController(ILeaveManagementService leaveManagementService)
    {
        _leaveManagementService = leaveManagementService;
    }

    [HttpGet("balances")]
    [Authorize(Roles = "4, 5")] // HR and Managers can view
    public async Task<ActionResult<ApiResponse<PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>>>> GetLeaveBalances([FromQuery] LeaveBalanceQueryRequestDto query)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _leaveManagementService.GetLeaveBalancesAsync(tenantId, query);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("my-balances")]
    public async Task<ActionResult<ApiResponse<EmployeeLeaveBalancesResponseDto>>> GetMyLeaveBalances()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<EmployeeLeaveBalancesResponseDto>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.GetMyLeaveBalancesAsync(tenantId, userId);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("request")]
    public async Task<ActionResult<ApiResponse<string>>> SubmitLeaveRequest([FromBody] SubmitLeaveRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.SubmitLeaveRequestAsync(tenantId, userId, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("my-requests")]
    [Authorize(Roles = "4,5,6")]
    public async Task<ActionResult<ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>>> GetMyLeaveRequests([FromQuery] LeaveRequestQueryDto query)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.GetMyLeaveRequestsAsync(tenantId, userId, query);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("request/{id}/cancel")]
    [Authorize(Roles = "4,5,6")]
    public async Task<ActionResult<ApiResponse<string>>> CancelLeaveRequest(int id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.CancelLeaveRequestAsync(tenantId, userId, id);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("team-requests")]
    [Authorize(Roles = "4,5")]
    public async Task<ActionResult<ApiResponse<PaginatedResponseDto<TeamLeaveRequestResponseDto>>>> GetTeamLeaveRequests([FromQuery] LeaveRequestQueryDto query)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<PaginatedResponseDto<TeamLeaveRequestResponseDto>>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.GetTeamLeaveRequestsAsync(tenantId, userId, query);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("request/{id}/approve")]
    [Authorize(Roles = "4,5")]
    public async Task<ActionResult<ApiResponse<string>>> ApproveLeaveRequest(int id, [FromBody] ReviewLeaveRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.ApproveLeaveRequestAsync(tenantId, userId, id, request.Comment);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("request/{id}/reject")]
    [Authorize(Roles = "4,5")]
    public async Task<ActionResult<ApiResponse<string>>> RejectLeaveRequest(int id, [FromBody] ReviewLeaveRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _leaveManagementService.RejectLeaveRequestAsync(tenantId, userId, id, request.Comment);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("balances")]
    [Authorize(Roles = "4")] // Only HR can allocate leave
    public async Task<ActionResult<ApiResponse<string>>> AllocateLeave([FromBody] AllocateLeaveRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _leaveManagementService.AllocateLeaveAsync(tenantId, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("balances/{id}")]
    [Authorize(Roles = "4")] // Only HR can update allocated leave
    public async Task<ActionResult<ApiResponse<string>>> UpdateLeaveBalance(int id, [FromBody] UpdateLeaveBalanceRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }
        
        var result = await _leaveManagementService.UpdateLeaveBalanceAsync(tenantId, id, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet("types")]
    [Authorize(Roles = "3,4,5,6")] // Admin, HR, Manager, Employee
    public async Task<ActionResult<ApiResponse<IEnumerable<LeaveTypeResponseDto>>>> GetLeaveTypes()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<IEnumerable<LeaveTypeResponseDto>>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _leaveManagementService.GetLeaveTypesAsync(tenantId);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("types")]
    [Authorize(Roles = "3")] // Only Tenant Admin
    public async Task<ActionResult<ApiResponse<string>>> CreateLeaveType([FromBody] CreateLeaveTypeRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _leaveManagementService.CreateLeaveTypeAsync(tenantId, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpPut("types/{id}")]
    [Authorize(Roles = "3")] // Only Tenant Admin
    public async Task<ActionResult<ApiResponse<string>>> UpdateLeaveType(int id, [FromBody] UpdateLeaveTypeRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _leaveManagementService.UpdateLeaveTypeAsync(tenantId, id, request);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }

    [HttpDelete("types/{id}")]
    [Authorize(Roles = "3")] // Only Tenant Admin
    public async Task<ActionResult<ApiResponse<string>>> DeleteLeaveType(int id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _leaveManagementService.DeleteLeaveTypeAsync(tenantId, id);
        if (result.Success)
            return Ok(result);
        
        return StatusCode(result.StatusCode, result);
    }
}

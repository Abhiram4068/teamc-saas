using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantEmployeeController : ControllerBase
{
    private readonly ITenantEmployeeService _tenantEmployeeService;
    private readonly ILogger<TenantEmployeeController> _logger;

    public TenantEmployeeController(
        ITenantEmployeeService tenantEmployeeService,
        ILogger<TenantEmployeeController> logger)
    {
        _tenantEmployeeService = tenantEmployeeService;
        _logger = logger;
    }

    [HttpGet("employees")]
    [Authorize(Roles="4, 5")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<EmployeeResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<EmployeeResponseDto>>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<EmployeeResponseDto>>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetEmployees([FromQuery] GetEmployeesRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var roleString = User.FindFirst(ClaimTypes.Role)?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId) ||
            string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId) ||
            string.IsNullOrEmpty(roleString))
        {
            _logger.LogWarning("Get Employees failed: Tenant ID, User ID, or Role not found in token or invalid.");
            return Unauthorized(ApiResponse<PagedResponseDto<EmployeeResponseDto>>.FailureResponse("Tenant ID, User ID, or Role not found in token.", 401));
        }

        if (!Enum.TryParse<Role>(roleString, out var role))
        {
            return Forbid();
        }

        _logger.LogInformation("Getting employees for Tenant: {TenantId}, Role: {Role}, ManagerId Filter: {ManagerId}", tenantId, role, request.ReportingManagerId);
        
        var response = await _tenantEmployeeService.GetEmployeesAsync(tenantId, userId, role, request);
        
        if (!response.Success && response.StatusCode == 403)
        {
            return Forbid();
        }
        
        return StatusCode(response.StatusCode, response);
    }
    
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDashboardSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDashboardSummaryDto>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDashboard()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var roleString = User.FindFirst(ClaimTypes.Role)?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId) ||
            string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId) ||
            string.IsNullOrEmpty(roleString))
        {
            return Unauthorized(ApiResponse<EmployeeDashboardSummaryDto>.FailureResponse("Tenant ID, User ID, or Role not found in token.", 401));
        }

        if (!Enum.TryParse<Role>(roleString, out var role))
        {
            return Forbid();
        }

        var response = await _tenantEmployeeService.GetDashboardSummaryAsync(tenantId, userId, role);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("employees/{id}")]
    [Authorize(Roles="3, 4, 5")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDetailedResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployeeById(long id)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var roleString = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId) ||
            string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var currentUserId) ||
            string.IsNullOrEmpty(roleString) || !Enum.TryParse<Role>(roleString, out var role))
        {
            return Unauthorized(ApiResponse<EmployeeDetailedResponseDto>.FailureResponse("Invalid token.", 401));
        }

        var response = await _tenantEmployeeService.GetEmployeeByIdAsync(tenantId, id, currentUserId, role);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("employees/{id}")]
    [Authorize(Roles = "3, 4")]
    public async Task<IActionResult> UpdateEmployeeProfile(long id, [FromBody] UpdateEmployeeProfileRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
            return Unauthorized();

        var response = await _tenantEmployeeService.UpdateEmployeeProfileAsync(tenantId, id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("employees/{id}/status")]
    [Authorize(Roles = "3, 4")]
    public async Task<IActionResult> UpdateUserStatus(long id, [FromBody] UpdateUserStatusRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
            return Unauthorized();

        var response = await _tenantEmployeeService.UpdateUserStatusAsync(tenantId, id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("employees/{id}")]
    [Authorize(Roles = "3, 4")]
    public async Task<IActionResult> DeleteEmployee(long id, [FromBody] DeleteUserRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
            return Unauthorized();

        var response = await _tenantEmployeeService.DeleteEmployeeAsync(tenantId, id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("employees/{id}/manager")]
    [Authorize(Roles = "3, 4")]
    public async Task<IActionResult> UpdateReportingManager(long id, [FromBody] UpdateReportingManagerRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
            return Unauthorized();

        var response = await _tenantEmployeeService.UpdateReportingManagerAsync(tenantId, id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("managers")]
    [Authorize(Roles = "3, 4")]
    public async Task<IActionResult> GetManagers([FromQuery] string? search)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
            return Unauthorized();

        var response = await _tenantEmployeeService.GetManagersAsync(tenantId, search);
        return StatusCode(response.StatusCode, response);
    }
}

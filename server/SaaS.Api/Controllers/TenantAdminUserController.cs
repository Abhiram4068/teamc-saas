using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantAdminUserController : ControllerBase
{
    private readonly ITenantEmployeeService _tenantEmployeeService;

    public TenantAdminUserController(ITenantEmployeeService tenantEmployeeService)
    {
        _tenantEmployeeService = tenantEmployeeService;
    }

    [HttpPost("employee")]
    [Authorize(Roles = "3")] 
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        var response = await _tenantEmployeeService.CreateEmployeeAsync(tenantId, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("employee")]
    [Authorize(Roles = "3")]
    public async Task<IActionResult> GetEmployees([FromQuery] GetEmployeesRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        var response = await _tenantEmployeeService.GetEmployeesAsync(tenantId, request);
        return StatusCode(response.StatusCode, response);
    }
}

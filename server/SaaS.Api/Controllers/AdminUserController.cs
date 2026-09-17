using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Api.Policies.Features;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Features;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class AdminUserController : ControllerBase
{
    private readonly ITenantFeatureService _tenantFeatureService;
    private readonly IAuthService _authService;
    private readonly ITenantAdminService _tenantAdminService;
    private readonly ILogger<AdminUserController> _logger;

    public AdminUserController(
        ITenantFeatureService tenantFeatureService,
        IAuthService authService,
        ITenantAdminService tenantAdminService,
        ILogger<AdminUserController> logger)
    {
        _tenantFeatureService = tenantFeatureService;
        _authService = authService;
        _tenantAdminService = tenantAdminService;
        _logger = logger;
    }

    [HttpPost("tenant/add-tenantadmin")]
    [RequireFeature("ADMIN_LIMIT")]
    [Authorize(Roles ="2")]
    public async Task<IActionResult> AddTenantAdmin([FromBody] TenantCreateTenantAdminRequestDto request)
    {
        // If the policy passess the feature check, we can proceed to check the limit 
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !long.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        // Get the limit for this feature that the tenant have subscription for with the code
        var limit = await _tenantFeatureService.GetFeatureLimitAsync((int)tenantId, "ADMIN_LIMIT");
        
        // If there's a limit, verify we haven't exceeded it
        if (limit.HasValue)
        {
            // Get the current count of admin users for this tenant
            var currentAdminCount = await _tenantFeatureService.GetCurrentAdminCountAsync((int)tenantId);
            
            if (currentAdminCount >= limit.Value)
            {
                _logger.LogWarning($"Admin limit exceeded for tenant {tenantId}. Limit: {limit.Value}, Current: {currentAdminCount}");
                return BadRequest(new { 
                    success = false, 
                    message = $"Limit exceeded: Your plan allows a maximum of {limit.Value} admin users." 
                });
            }
        }

        var response = await _authService.CreateTenantAdminAsync((int)tenantId, request);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("tenant/tenantadmins")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> GetTenantAdmins()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !long.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        var response = await _tenantAdminService.GetTenantAdminsAsync(tenantId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPatch("tenant/tenantadmin/{id}")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> UpdateTenantAdmin(long id, [FromBody] UpdateTenantAdminRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !long.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        var response = await _tenantAdminService.UpdateTenantAdminAsync(tenantId, id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPatch("tenant/tenantadmin/{id}/status")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> UpdateTenantAdminStatus(long id, [FromBody] UpdateTenantAdminStatusRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !long.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        var response = await _tenantAdminService.UpdateTenantAdminStatusAsync(tenantId, id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("tenant/tenantadmin/{id}")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> DeleteTenantAdmin(long id)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !long.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        var response = await _tenantAdminService.SoftDeleteTenantAdminAsync(tenantId, id);
        return StatusCode(response.StatusCode, response);
    }
}

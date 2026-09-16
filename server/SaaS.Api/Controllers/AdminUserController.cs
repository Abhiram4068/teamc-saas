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
    private readonly ILogger<AdminUserController> _logger;

    public AdminUserController(
        ITenantFeatureService tenantFeatureService,
        IAuthService authService,
        ILogger<AdminUserController> logger)
    {
        _tenantFeatureService = tenantFeatureService;
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("tenant/add-tenantadmin")]
    [RequireFeature("ADMIN_LIMIT")]
    public async Task<IActionResult> AddTenantAdmin([FromBody] TenantCreateTenantAdminRequestDto request)
    {
        // If the policy passess the feature check, we can proceed to check the limit 
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { success = false, message = "Tenant ID not found in token" });
        }

        // Get the limit for this feature that the tenant have subscription for with the code
        var limit = await _tenantFeatureService.GetFeatureLimitAsync(tenantId, "ADMIN_LIMIT");
        
        // If there's a limit, verify we haven't exceeded it
        if (limit.HasValue)
        {
            // Get the current count of admin users for this tenant
            var currentAdminCount = await _tenantFeatureService.GetCurrentAdminCountAsync(tenantId);
            
            if (currentAdminCount >= limit.Value)
            {
                _logger.LogWarning($"Admin limit exceeded for tenant {tenantId}. Limit: {limit.Value}, Current: {currentAdminCount}");
                return BadRequest(new { 
                    success = false, 
                    message = $"Limit exceeded: Your plan allows a maximum of {limit.Value} admin users." 
                });
            }
        }

        var response = await _authService.CreateTenantAdminAsync(tenantId, request);

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return StatusCode(response.StatusCode, response);
    }
}

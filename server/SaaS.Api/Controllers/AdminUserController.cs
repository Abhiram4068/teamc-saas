using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Api.Policies.Features;
using SaaS.Application.Interfaces.Features;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles ="2")] 
public class AdminUserController : ControllerBase
{
    private readonly ITenantFeatureService _tenantFeatureService;
    private readonly ILogger<AdminUserController> _logger;

    public AdminUserController(
        ITenantFeatureService tenantFeatureService,
        ILogger<AdminUserController> logger)
    {
        _tenantFeatureService = tenantFeatureService;
        _logger = logger;
    }

    [HttpPost("tenant/add-tenantadmin")]
    [RequireFeature("ADMIN_LIMIT")]
    public async Task<IActionResult> AddTenantAdmin()
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

        // Mock success response
        // Actual logic to create the admin user would go here
        return Ok(new { success = true, message = "hi" });
    }
}

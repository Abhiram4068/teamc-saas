using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlansController : ControllerBase
{
    private readonly IPlanService _planService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<PlansController> _logger;

    public PlansController(
        IPlanService planService, 
        ISubscriptionService subscriptionService,
        ILogger<PlansController> logger)
    {
        _planService = planService;
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    [HttpPost]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> CreatePlan([FromBody] CreatePlanRequestDto request)
    {
        var createdBy = User.FindFirst(ClaimTypes.Email)?.Value 
                     ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

        _logger.LogInformation("Create plan request received for Code: {Code} by User: {CreatedBy}.", request.Code, createdBy);

        var response = await _planService.CreatePlanAsync(request, createdBy);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "1, 2")]
    public async Task<IActionResult> GetPlanById(int id)
    {
        _logger.LogInformation("Get plan by ID {PlanId} request received.", id);

        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        int? role = null;
        if (int.TryParse(roleClaim, out var r))
        {
            role = r;
        }

        var response = await _planService.GetPlanByIdAsync(id, role);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> GetPlans([FromQuery] GetPlansRequestDto request)
    {
        _logger.LogInformation("Get plans request received.");

        var response = await _planService.GetPlansAsync(request);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdatePlanRequestDto request)
    {
        _logger.LogInformation("Update plan request received for ID: {PlanId}.", id);

        var response = await _planService.UpdatePlanAsync(id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> UpdatePlanStatus(int id, [FromBody] UpdatePlanStatusRequestDto request)
    {
        _logger.LogInformation("Update plan status request received for ID: {PlanId}.", id);

        var response = await _planService.UpdatePlanStatusAsync(id, request);
        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> DeletePlan(int id)
    {
        _logger.LogInformation("Delete plan request received for ID: {PlanId}.", id);

        var response = await _planService.SoftDeletePlanAsync(id);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("map-features")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> MapFeaturesToPlan([FromBody] MapPlanFeatureRequestDto request)
    {
        _logger.LogInformation("Map features to plan request received for PlanId: {PlanId}.", request.PlanId);

        var response = await _planService.MapFeaturesToPlanAsync(request);

        return StatusCode(response.StatusCode, response);
    }


    [HttpGet("{planId}/features")]
    [Authorize(Roles = "1, 2")]
    public async Task<IActionResult> GetFeaturesForPlan(int planId)
    {
        _logger.LogInformation("Get features for plan ID {PlanId} request received.", planId);

        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        int? role = null;
        if (int.TryParse(roleClaim, out var r))
        {
            role = r;
        }

        var response = await _planService.GetFeaturesForPlanAsync(planId, role);

        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("{planId}/features/{featureId}")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> RemoveFeatureFromPlan(int planId, int featureId)
    {
        _logger.LogInformation("Remove feature {FeatureId} from plan {PlanId} request received.", featureId, planId);

        var response = await _planService.RemoveFeatureFromPlanAsync(planId, featureId);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("myfeatures")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> GetMyPlanFeatures()
    {
        var tenantId = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantId) || !int.TryParse(tenantId, out var id))
        {
            _logger.LogWarning("Get MyPlan Features failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Getting plan features for Tenant: {TenantId}", id);

        var response = await _subscriptionService.GetMyPlanFeaturesAsync(id);
        
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("available")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> GetAvailablePlans()
    {
        var tenantIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Get Available Plans failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Getting available plans for Tenant: {TenantId}", tenantId);

        var response = await _planService.GetAvailablePlansForTenantAsync(tenantId);
        
        return StatusCode(response.StatusCode, response);
    }
}

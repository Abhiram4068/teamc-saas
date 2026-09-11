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
    private readonly ILogger<PlansController> _logger;

    public PlansController(IPlanService planService, ILogger<PlansController> logger)
    {
        _planService = planService;
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
    [Authorize(Roles = "1")]
    public async Task<IActionResult> GetPlanById(int id)
    {
        _logger.LogInformation("Get plan by ID {PlanId} request received.", id);

        var response = await _planService.GetPlanByIdAsync(id);

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

    [HttpPost("map-features")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> MapFeaturesToPlan([FromBody] MapPlanFeatureRequestDto request)
    {
        _logger.LogInformation("Map features to plan request received for PlanId: {PlanId}.", request.PlanId);

        var response = await _planService.MapFeaturesToPlanAsync(request);

        return StatusCode(response.StatusCode, response);
    }


    [HttpGet("{planId}/features")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> GetFeaturesForPlan(int planId)
    {
        _logger.LogInformation("Get features for plan ID {PlanId} request received.", planId);

        var response = await _planService.GetFeaturesForPlanAsync(planId);

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
}

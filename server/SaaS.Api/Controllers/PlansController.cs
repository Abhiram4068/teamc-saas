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
}

using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/public/plans")]
public class PublicPlansController : ControllerBase
{
    private readonly IPlanService _planService;
    private readonly ILogger<PublicPlansController> _logger;

    public PublicPlansController(IPlanService planService, ILogger<PublicPlansController> logger)
    {
        _planService = planService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicPlans()
    {
        _logger.LogInformation("Public plans request received.");

        var response = await _planService.PublicPlanGetAsync();

        return StatusCode(response.StatusCode, response);
    }
}

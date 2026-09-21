using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantController : ControllerBase
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<TenantController> _logger;

    public TenantController(
        ITenantService tenantService,
        ILogger<TenantController> logger)
    {
        _tenantService = tenantService;
        _logger = logger;
    }

    [HttpGet("features")]
    [ProducesResponseType(typeof(ApiResponse<TenantFeaturesResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TenantFeaturesResponseDto>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<TenantFeaturesResponseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTenantFeatures()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Get Features failed: Tenant ID not found in token or invalid.");
            return Unauthorized(ApiResponse<TenantFeaturesResponseDto>.FailureResponse("Tenant ID not found in token.", 401));
        }

        _logger.LogInformation("Getting features for Tenant: {TenantId}", tenantId);
        var response = await _tenantService.GetTenantFeaturesAsync(tenantId);
        
        return StatusCode(response.StatusCode, response);
    }
}

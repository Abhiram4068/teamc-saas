using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<SubscriptionsController> _logger;

    public SubscriptionsController(
        ISubscriptionService subscriptionService,
        ILogger<SubscriptionsController> logger)
    {
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "2")] 
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId) ||
            string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
        {
            _logger.LogWarning("Checkout failed: Tenant ID or User ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID or User ID not found in token." });
        }

        _logger.LogInformation("Creating checkout session for Tenant: {TenantId}, Plan: {PlanId}", tenantId, request.PlanId);

        var response = await _subscriptionService.CreateCheckoutSessionAsync(request, userId, tenantId);
        
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet]
    [Authorize(Roles = "2")] 
    public async Task<IActionResult> GetCurrentSubscription()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Get Subscription failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Getting subscription for Tenant: {TenantId}", tenantId);
        var response = await _subscriptionService.GetCurrentSubscriptionAsync(tenantId);
        
        return StatusCode(response.StatusCode, response);
    }
}

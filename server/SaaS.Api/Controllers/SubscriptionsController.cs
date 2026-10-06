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

    [HttpGet("scheduled")]
    [Authorize(Roles = "2")] 
    public async Task<IActionResult> GetScheduledSubscription()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Get Scheduled Subscription failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Getting scheduled subscription for Tenant: {TenantId}", tenantId);
        var response = await _subscriptionService.GetScheduledSubscriptionAsync(tenantId);
        
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("cancel-scheduled")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> CancelScheduledSubscription([FromBody] CancelSubscriptionRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Cancel Scheduled Subscription failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Canceling scheduled subscription {SubscriptionId} for Tenant: {TenantId}", request.SubscriptionId, tenantId);
        var response = await _subscriptionService.CancelScheduledSubscriptionAsync(request.SubscriptionId, tenantId);
        
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("cancel")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> CancelSubscription()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Cancel Subscription failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Canceling active subscription for Tenant: {TenantId}", tenantId);
        var response = await _subscriptionService.CancelSubscriptionAsync(tenantId);
        
        return StatusCode(response.StatusCode, response);
    }
    

    /// <summary>
    /// Schedules an upgrade to a new plan to take effect at the end of the current billing cycle.
    /// </summary>
    [HttpPost("upgrade-scheduled")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> ScheduleSubscriptionUpgrade([FromBody] UpgradeSubscriptionRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Schedule Subscription Upgrade failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Scheduling upgrade to Plan {PlanId} for Tenant: {TenantId}", request.PlanId, tenantId);
        var response = await _subscriptionService.ScheduleSubscriptionUpgradeAsync(tenantId, request.PlanId, request.BillingCycle);
        
        return StatusCode(response.StatusCode, response);
    }

    /// <summary>
    /// Previews the prorated amount the user will be charged if they upgrade immediately.
    /// </summary>
    [HttpPost("preview-proration")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> PreviewProration([FromBody] UpgradeSubscriptionRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        var response = await _subscriptionService.PreviewUpgradeProrationAsync(tenantId, request.PlanId, request.BillingCycle);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("saved-cards")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> GetSavedCards()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        var response = await _subscriptionService.GetSavedPaymentMethodsAsync(tenantId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("setup-intent")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> CreateSetupIntent()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        var response = await _subscriptionService.CreateSetupIntentAsync(tenantId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("upgrade-immediately-with-card")]
    [Authorize(Roles = "2")]
    public async Task<IActionResult> UpgradeSubscriptionImmediatelyWithCard([FromBody] UpgradeSubscriptionWithCardRequestDto request)
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        _logger.LogInformation("Upgrading immediately with card to Plan {PlanId} for Tenant: {TenantId}", request.PlanId, tenantId);
        var response = await _subscriptionService.UpgradeSubscriptionImmediatelyWithCardAsync(tenantId, request.PlanId, request.BillingCycle, request.PaymentMethodId);
        return StatusCode(response.StatusCode, response);
    }
}

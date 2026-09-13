using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<SubscriptionsController> _logger;

    public SubscriptionsController(
        ISubscriptionService subscriptionService,
        IUserRepository userRepository,
        ILogger<SubscriptionsController> logger)
    {
        _subscriptionService = subscriptionService;
        _userRepository = userRepository;
        _logger = logger;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutRequestDto request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
        {
            _logger.LogWarning("Checkout failed: User ID not found in token or invalid.");
            return Unauthorized(new { Message = "User ID not found in token." });
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.TenantId == null)
        {
            _logger.LogWarning("Checkout failed: User {UserId} or Tenant not found.", userId);
            return BadRequest(new { Message = "User or Tenant not found." });
        }

        int tenantId = (int)user.TenantId.Value;

        _logger.LogInformation("Creating checkout session for User: {UserId}, Tenant: {TenantId}, Plan: {PlanId}", userId, tenantId, request.PlanId);

        var response = await _subscriptionService.CreateCheckoutSessionAsync(request, userId, tenantId);
        
        return StatusCode(response.StatusCode, response);
    }
}

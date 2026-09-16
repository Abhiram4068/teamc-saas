using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "2")] 
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;
    private readonly ILogger<BillingController> _logger;

    public BillingController(
        IBillingService billingService,
        ILogger<BillingController> logger)
    {
        _billingService = billingService;
        _logger = logger;
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> GetMyInvoices()
    {
        var tenantIdString = User.FindFirst("TenantId")?.Value;
                        
        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            _logger.LogWarning("Get Invoices failed: Tenant ID not found in token or invalid.");
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        var response = await _billingService.GetMyInvoicesAsync(tenantId);
        return StatusCode(response.StatusCode, response);
    }
}

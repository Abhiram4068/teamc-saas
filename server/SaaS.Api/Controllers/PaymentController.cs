using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Service;
using System.Security.Claims;

namespace SaaS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "2")] 
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetPaymentHistory([FromQuery] GetPaymentsRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !long.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(new { Message = "Tenant ID not found in token." });
        }

        var result = await _paymentService.GetPaymentsAsync(tenantId, request);
        return Ok(result);
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[Route("api/[controller]/")]
[ApiController]
[Authorize(Roles = "1")] 
public class SuperadminController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public SuperadminController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet("tenants")]
    public async Task<IActionResult> GetTenants([FromQuery] TenantQueryRequestDto query)
    {
        var result = await _tenantService.GetTenantsPaginatedAsync(query);
        return Ok(result);
    }
}

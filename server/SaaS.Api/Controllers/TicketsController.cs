using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;
using System.Security.Claims;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(ITicketService ticketService, ILogger<TicketsController> logger)
    {
        _ticketService = ticketService;
        _logger = logger;
    }

    private bool TryGetUserClaims(out string email, out Role role, out long? tenantId)
    {
        email = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
        
        var roleStr = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("Role")?.Value;
        var hasRole = Enum.TryParse<Role>(roleStr, true, out role);
        
        var tenantIdStr = User.FindFirst("TenantId")?.Value;
        tenantId = string.IsNullOrEmpty(tenantIdStr) ? null : long.Parse(tenantIdStr);

        return !string.IsNullOrEmpty(email) && hasRole;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromForm] CreateTicketRequestDto dto)
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.CreateTicketAsync(dto, email, role, tenantId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("my-tickets")]
    public async Task<IActionResult> GetMyTickets()
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.GetMyTicketsAsync(email);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("assigned")]
    [Authorize(Roles = "1, 2, 3")]
    public async Task<IActionResult> GetAssignedTickets([FromQuery] string? status, [FromQuery] string? search, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.GetAssignedTicketsPagedAsync(email, status, search, pageNumber, pageSize);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("tenant")]
    public async Task<IActionResult> GetTenantTickets()
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        if (role != Role.Tenant && role != Role.SuperAdmin)
        {
            return Forbid();
        }

        if (!tenantId.HasValue)
        {
            return BadRequest(ApiResponse<List<TicketResponseDto>>.FailureResponse("Tenant ID is required.", 400));
        }

        var response = await _ticketService.GetTenantTicketsAsync(tenantId.Value);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTicketById(long id)
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.GetTicketByIdAsync(id, email, role, tenantId);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("{id}/reply")]
    public async Task<IActionResult> ReplyToTicket(long id, [FromBody] TicketReplyRequestDto dto)
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.ReplyToTicketAsync(id, dto, email);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTicketStatus(long id, [FromBody] UpdateTicketStatusRequestDto dto)
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.UpdateTicketStatusAsync(id, dto.Status, email, role);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "1, 2, 3")]
    public async Task<IActionResult> GetDashboardStats()
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var response = await _ticketService.GetDashboardStatsAsync(email);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{ticketId}/download/{fileName}")]
    public async Task<IActionResult> DownloadAttachment(long ticketId, string fileName)
    {
        if (!TryGetUserClaims(out var email, out var role, out var tenantId))
            return Unauthorized(ApiResponse<object>.FailureResponse("User claims not found or invalid.", 401));

        var ticketResponse = await _ticketService.GetTicketByIdAsync(ticketId, email, role, tenantId);
        if (ticketResponse.StatusCode != 200)
        {
            return StatusCode(ticketResponse.StatusCode, ApiResponse<object>.FailureResponse("Unauthorized to access this ticket or ticket not found.", ticketResponse.StatusCode));
        }

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Tickets", fileName);
        if (!System.IO.File.Exists(filePath))
            return NotFound(ApiResponse<object>.FailureResponse("File not found.", 404));

        var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filePath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        var bytes = System.IO.File.ReadAllBytes(filePath);
        return File(bytes, contentType, fileName);
    }
}

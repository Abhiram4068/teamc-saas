using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Api.Policies.Features;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "4,5,6")]
[RequireFeature("DCMT_STRGE")]
public class DocumentController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")] // Returns 415 if Content-Type is not multipart/form-data
    public async Task<ActionResult<ApiResponse<string>>> Upload([FromForm] DocumentUploadRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) ||
            string.IsNullOrEmpty(userIdClaim) || !long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<string>.FailureResponse("User claims not found in token.", 401));
        }

        var result = await _documentService.UploadDocumentAsync(tenantId, userId, request);
        
        if (result.Success)
            return Ok(result);
            
        return StatusCode(result.StatusCode, result);
    }
}

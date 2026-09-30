using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces.Service;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;

namespace SaaS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "2")] // Role 2 is Tenant
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInvoices([FromQuery] SaaS.Application.DTOs.Requests.GetPaymentsRequestDto request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !long.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<object>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _invoiceService.GetInvoicesAsync(tenantId, request);
        // Returning the paginated list wrapped in ApiResponse
        return Ok(ApiResponse<PaginatedResponseDto<PaymentResponseDto>>.SuccessResponse(result, "Invoices retrieved successfully."));
    }

    [HttpGet("{paymentId}")]
    public async Task<IActionResult> GetInvoiceDetails(Guid paymentId)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !long.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<object>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var result = await _invoiceService.GetInvoiceDetailsAsync(tenantId, paymentId);
        
        if (result == null)
        {
            return NotFound(ApiResponse<object>.FailureResponse("Invoice not found or payment is not completed.", 404));
        }

        return Ok(ApiResponse<InvoiceDetailsDto>.SuccessResponse(result, "Invoice details retrieved successfully."));
    }

    [HttpGet("{paymentId}/download")]
    public async Task<IActionResult> DownloadInvoice(Guid paymentId)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !long.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized(ApiResponse<object>.FailureResponse("Tenant ID not found in token.", 401));
        }

        var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(tenantId, paymentId);
        
        if (pdfBytes == null || pdfBytes.Length == 0)
        {
            return NotFound(ApiResponse<object>.FailureResponse("Invoice not found or payment is not completed.", 404));
        }

        // Return HTML file since we generated HTML bytes in the service
        return File(pdfBytes, "text/html", $"Invoice_{paymentId}.html");
    }
}

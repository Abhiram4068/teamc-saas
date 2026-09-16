using Microsoft.Extensions.Logging;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class BillingService : IBillingService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly ILogger<BillingService> _logger;

    public BillingService(
        IPaymentRepository paymentRepository,
        ILogger<BillingService> logger)
    {
        _paymentRepository = paymentRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<IEnumerable<InvoiceResponseDto>>> GetMyInvoicesAsync(long tenantId)
    {
        try
        {
            var payments = await _paymentRepository.GetByTenantIdAsync(tenantId);

            var invoices = payments
                .Select(p => new InvoiceResponseDto
                {
                    Id = p.Id.ToString(),
                    Number = "INV-" + p.Id.ToString().Substring(0, 8).ToUpper(),
                    AmountPaid = p.Amount,
                    Currency = "INR",
                    Status = "paid",
                    Created = p.PaymentDate ?? p.CreatedAt,
                    PlanName = p.Subscription?.Plan?.Name ?? "Unknown Plan",
                    InvoicePdfUrl = "",
                    HostedInvoiceUrl = ""
                })
                .ToList();

            return ApiResponse<IEnumerable<InvoiceResponseDto>>.SuccessResponse(invoices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching invoices for tenant {TenantId}", tenantId);
            return ApiResponse<IEnumerable<InvoiceResponseDto>>.FailureResponse("Failed to fetch invoices");
        }
    }
}

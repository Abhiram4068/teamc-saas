using System.Text;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;

using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IPaymentRepository _paymentRepository;

    public InvoiceService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<InvoiceDetailsDto?> GetInvoiceDetailsAsync(long tenantId, Guid paymentId)
    {
        var payment = await _paymentRepository.GetPaymentForInvoiceAsync(paymentId);
        
        if (payment == null || payment.TenantId != tenantId || payment.Status != PaymentStatus.Succeeded)
        {
            return null;
        }

        return new InvoiceDetailsDto
        {
            PaymentId = payment.Id,
            StripeInvoiceId = payment.StripeInvoiceId ?? string.Empty,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            TenantName = payment.User?.FirstName + " " + payment.User?.LastName,
            CompanyName = payment.Tenant?.CompanyName ?? string.Empty,
            Address = payment.Tenant?.Address ?? string.Empty,
            Pincode = payment.Tenant?.Pincode ?? string.Empty,
            UserEmail = payment.User?.Email ?? string.Empty,
            UserPhone = payment.User?.PhoneNumber ?? string.Empty,
            PlanName = payment.Subscription?.Plan?.Name ?? string.Empty,
            MonthlyPrice = payment.Subscription?.Plan?.MonthlyPrice ?? 0,
            YearlyPrice = payment.Subscription?.Plan?.YearlyPrice ?? 0,
            Currency = payment.Subscription?.Plan?.Currency.ToString() ?? "INR"
        };
    }

    public async Task<byte[]> GenerateInvoicePdfAsync(long tenantId, Guid paymentId)
    {
        var invoice = await GetInvoiceDetailsAsync(tenantId, paymentId);
        if (invoice == null)
        {
            return Array.Empty<byte>();
        }

        // Generate a simple HTML invoice since no PDF library is strictly specified
        var html = $@"
        <html>
        <head>
            <title>Invoice - {invoice.StripeInvoiceId}</title>
            <style>
                body {{ font-family: Arial, sans-serif; padding: 20px; }}
                h1 {{ color: #333; }}
                .invoice-header {{ border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }}
                .invoice-details {{ margin-bottom: 30px; }}
                .invoice-details th {{ text-align: left; padding-right: 20px; }}
            </style>
        </head>
        <body>
            <div class='invoice-header'>
                <h1>INVOICE</h1>
                <p><strong>Invoice ID:</strong> {invoice.StripeInvoiceId}</p>
                <p><strong>Date:</strong> {invoice.PaymentDate?.ToString("f")}</p>
            </div>
            
            <div class='invoice-details'>
                <h3>Bill To:</h3>
                <p><strong>{invoice.CompanyName}</strong></p>
                <p>{invoice.TenantName}</p>
                <p>{invoice.Address}</p>
                <p>{invoice.Pincode}</p>
                <p>{invoice.UserEmail}</p>
            </div>

            <table style='width: 100%; border-collapse: collapse;'>
                <thead>
                    <tr style='background-color: #f8f9fa; text-align: left;'>
                        <th style='padding: 10px; border: 1px solid #dee2e6;'>Description</th>
                        <th style='padding: 10px; border: 1px solid #dee2e6;'>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{invoice.PlanName} Subscription</td>
                        <td style='padding: 10px; border: 1px solid #dee2e6;'>{invoice.Amount} {invoice.Currency}</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 style='text-align: right; margin-top: 20px;'>Total: {invoice.Amount} {invoice.Currency}</h3>
            
            <p style='text-align: center; color: #6c757d; margin-top: 50px;'>Thank you for your business!</p>
        </body>
        </html>";

        return Encoding.UTF8.GetBytes(html);
    }

    public async Task<PaginatedResponseDto<PaymentResponseDto>> GetInvoicesAsync(long tenantId, DTOs.Requests.GetPaymentsRequestDto request)
    {
        var (items, totalCount) = await _paymentRepository.GetPaginatedInvoicesAsync(
            tenantId,
            request.SearchTerm,
            request.SortColumn,
            request.SortOrder,
            request.PageNumber,
            request.PageSize
        );

        var payments = items.Select(p => new PaymentResponseDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            SubscriptionId = p.SubscriptionId,
            PlanName = p.Subscription != null && p.Subscription.Plan != null ? p.Subscription.Plan.Name : string.Empty,
            Amount = p.Amount,
            Status = p.Status,
            PaymentDate = p.PaymentDate,
            StripeInvoiceId = p.StripeInvoiceId ?? string.Empty,
            CreatedAt = p.CreatedAt
        }).ToList();

        return new PaginatedResponseDto<PaymentResponseDto>
        {
            Items = payments,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<PaginatedResponseDto<PaymentResponseDto>> GetPaymentsAsync(long tenantId, GetPaymentsRequestDto request)
    {
        var (items, totalCount) = await _paymentRepository.GetPaginatedPaymentsAsync(
            tenantId,
            request.SearchTerm,
            request.Status,
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

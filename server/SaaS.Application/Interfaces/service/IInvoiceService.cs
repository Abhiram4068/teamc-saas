using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IInvoiceService
{
    Task<InvoiceDetailsDto?> GetInvoiceDetailsAsync(long tenantId, Guid paymentId);
    Task<byte[]> GenerateInvoicePdfAsync(long tenantId, Guid paymentId);
    Task<PaginatedResponseDto<PaymentResponseDto>> GetInvoicesAsync(long tenantId, SaaS.Application.DTOs.Requests.GetPaymentsRequestDto request);
}

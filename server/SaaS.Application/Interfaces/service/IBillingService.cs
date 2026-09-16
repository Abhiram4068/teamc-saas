using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IBillingService
{
    Task<ApiResponse<IEnumerable<InvoiceResponseDto>>> GetMyInvoicesAsync(long tenantId);
}

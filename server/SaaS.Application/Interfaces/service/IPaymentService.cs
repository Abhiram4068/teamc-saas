using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IPaymentService
{
    Task<PaginatedResponseDto<PaymentResponseDto>> GetPaymentsAsync(long tenantId, GetPaymentsRequestDto request);
}

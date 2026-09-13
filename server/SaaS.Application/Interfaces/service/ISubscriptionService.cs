using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface ISubscriptionService
{
    Task<ApiResponse<CheckoutResponseDto>> CreateCheckoutSessionAsync(
        CreateCheckoutRequestDto request,
        int userId,
        int tenantId);
}
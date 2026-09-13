using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IAuthService
{
    /// <summary>
    /// Authenticates a SuperAdmin user.
    /// </summary>
    /// <param name="request">The login credentials request DTO.</param>
    /// <returns>A task returning an <see cref="ApiResponse{T}"/> containing <see cref="LoginResponseDto"/>.</returns>
    Task<ApiResponse<LoginResponseDto>> SuperAdminLoginAsync(LoginRequestDto request);

    /// <summary>
    /// Authenticates a normal user (Tenant, TenantAdmin, Manager, Employee).
    /// </summary>
    /// <param name="request">The login credentials request DTO.</param>
    /// <returns>A task returning an <see cref="ApiResponse{T}"/> containing <see cref="LoginResponseDto"/>.</returns>
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request);

    /// <summary>
    /// Issues new access and refresh tokens using a valid refresh token.
    /// </summary>
    /// <param name="request">The refresh token request DTO.</param>
    /// <returns>A task returning an <see cref="ApiResponse{T}"/> containing <see cref="RefreshTokenResponseDto"/>.</returns>
    Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request);

    /// <summary>
    /// Registers a new tenant and an associated tenant admin user.
    /// </summary>
    /// <param name="request">The registration request DTO.</param>
    /// <returns>A task returning an <see cref="ApiResponse{T}"/> containing a success message.</returns>
    Task<ApiResponse<string>> RegisterTenantAsync(RegisterTenantRequestDto request);
}
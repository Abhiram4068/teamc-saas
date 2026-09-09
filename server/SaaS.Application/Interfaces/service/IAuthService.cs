using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IAuthService
{
    /// <summary>
    /// Authenticates a user with email and password and returns access and refresh tokens.
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
}
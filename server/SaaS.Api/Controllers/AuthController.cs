using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

/// <summary>
/// Controller for handling authentication and user authorization operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthController"/> class.
    /// </summary>
    /// <param name="authService">The authentication service instance.</param>
    /// <param name="logger">The logger instance.</param>
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticates a user with credentials and returns access and refresh tokens.
    /// </summary>
    /// <param name="request">The user login credentials request DTO.</param>
    /// <returns>An <see cref="IActionResult"/> containing the API response with authentication tokens.</returns>
    [HttpPost("admin/login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        _logger.LogInformation("Login request received for email {Email}.", request.Email);

        var response = await _authService.LoginAsync(request);

        return StatusCode(response.StatusCode, response);
    }

    /// <summary>
    /// Issues a new access token and refresh token using a valid refresh token.
    /// </summary>
    /// <param name="request">The refresh token request DTO.</param>
    /// <returns>An <see cref="IActionResult"/> containing the API response with new authentication tokens.</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        _logger.LogInformation("Refresh token request received.");

        var response = await _authService.RefreshTokenAsync(request);

        return StatusCode(response.StatusCode, response);
    }
}

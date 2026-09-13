using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SaaS.Application.Configurations;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

/// <summary>
/// Service implementation for authentication and token refresh operations.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthService"/> class.
    /// </summary>
    /// <param name="userRepository">The user repository instance.</param>
    /// <param name="jwtService">The JWT service instance.</param>
    /// <param name="passwordHasher">The password hasher instance.</param>
    /// <param name="jwtOptions">The JWT settings configuration options.</param>
    /// <param name="logger">The logger instance.</param>
    public AuthService(
        IUserRepository userRepository,
        ITenantRepository tenantRepository,
        IJwtService jwtService,
        IPasswordHasher<User> passwordHasher,
        IOptions<JwtSettings> jwtOptions,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _jwtSettings = jwtOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Authenticates a user with email and password and returns access and refresh tokens.
    /// </summary>
    /// <param name="request">The login credentials request DTO.</param>
    /// <returns>An <see cref="ApiResponse{T}"/> containing <see cref="LoginResponseDto"/> with tokens.</returns>
    public async Task<ApiResponse<LoginResponseDto>> SuperAdminLoginAsync(LoginRequestDto request)
    {
        _logger.LogInformation(
            "Processing login request for email {Email}.",
            request.Email);

        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user is null)
        {
            _logger.LogWarning(
                "Login failed. User with email {Email} was not found.",
                request.Email);

            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        if (user.Status == UserStatus.Inactive)
        {
            _logger.LogWarning(
                "Login failed. Disabled account attempted to login. UserId: {UserId}",
                user.Id);

            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        if (user.Role != Role.SuperAdmin)
        {
            _logger.LogWarning(
                "Login failed. Non-admin {UserId} attemtped to login",
                user.Id);
            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        bool isPasswordValid = false;

        if (!string.IsNullOrEmpty(user.PasswordHash) && user.PasswordHash.StartsWith("$2"))
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        else
        {
            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

            isPasswordValid = passwordVerificationResult != PasswordVerificationResult.Failed;
        }

        if (!isPasswordValid)
        {
            _logger.LogWarning(
                "Login failed. Invalid password for UserId: {UserId}",
                user.Id);

            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        var expiryTime = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes);

        _logger.LogInformation(
            "Generating JWT tokens for UserId: {UserId}",
            user.Id);

        var accessToken = _jwtService.GenerateAccessToken(user, expiryTime);
        var refreshToken = _jwtService.GenerateRefreshToken(user);

        _logger.LogInformation(
            "User {UserId} logged in successfully.",
            user.Id);

        var loginDto = new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = expiryTime,
            Role = (int)user.Role
        };

        return ApiResponse<LoginResponseDto>.SuccessResponse(loginDto, "Login successful.", 200);
    }

    /// <summary>
    /// Authenticates a normal user with email and password and returns access and refresh tokens.
    /// </summary>
    /// <param name="request">The login credentials request DTO.</param>
    /// <returns>An <see cref="ApiResponse{T}"/> containing <see cref="LoginResponseDto"/> with tokens.</returns>
    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        _logger.LogInformation(
            "Processing public login request for email {Email}.",
            request.Email);

        // Without normalize per user request
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user is null)
        {
            _logger.LogWarning(
                "Login failed. User with email {Email} was not found.",
                request.Email);

            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        if (user.Status != UserStatus.Active)
        {
            _logger.LogWarning(
                "Login failed. Inactive account attempted to login. UserId: {UserId}",
                user.Id);

            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        bool isPasswordValid = false;

        if (!string.IsNullOrEmpty(user.PasswordHash) && user.PasswordHash.StartsWith("$2"))
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        else
        {
            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

            isPasswordValid = passwordVerificationResult != PasswordVerificationResult.Failed;
        }

        if (!isPasswordValid)
        {
            _logger.LogWarning(
                "Login failed. Invalid password for UserId: {UserId}",
                user.Id);

            return ApiResponse<LoginResponseDto>.FailureResponse("Invalid email or password.", 401);
        }

        // Update LastLogin
        user.LastLogin = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync();

        var expiryTime = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes);

        _logger.LogInformation(
            "Generating JWT tokens for UserId: {UserId}",
            user.Id);

        var accessToken = _jwtService.GenerateAccessToken(user, expiryTime);
        var refreshToken = _jwtService.GenerateRefreshToken(user);

        _logger.LogInformation(
            "User {UserId} logged in successfully.",
            user.Id);

        var loginDto = new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = expiryTime,
            Role = (int)user.Role
        };

        return ApiResponse<LoginResponseDto>.SuccessResponse(loginDto, "Login successful.", 200);
    }

    /// <summary>
    /// Issues new access and refresh tokens using a valid refresh token.
    /// </summary>
    /// <param name="request">The refresh token request DTO.</param>
    /// <returns>An <see cref="ApiResponse{T}"/> containing <see cref="RefreshTokenResponseDto"/> with new tokens.</returns>
    public async Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        _logger.LogInformation("Processing refresh token request.");

        var principal = _jwtService.ValidateRefreshToken(request.RefreshToken);

        if (principal is null)
        {
            _logger.LogWarning("Refresh token validation failed. Token is invalid or expired.");
            return ApiResponse<RefreshTokenResponseDto>.FailureResponse("Invalid or expired refresh token.", 401);
        }

        var userIdStr = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                        ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdStr, out var userId))
        {
            _logger.LogWarning("Refresh token validation failed. Could not parse user ID from claims.");
            return ApiResponse<RefreshTokenResponseDto>.FailureResponse("Invalid or expired refresh token.", 401);
        }

        var user = await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            _logger.LogWarning("Refresh token failed. User with UserId {UserId} not found.", userId);
            return ApiResponse<RefreshTokenResponseDto>.FailureResponse("Invalid or expired refresh token.", 401);
        }

        if (user.Status == UserStatus.Inactive)
        {
            _logger.LogWarning("Refresh token failed. Account is disabled for UserId: {UserId}", userId);
            return ApiResponse<RefreshTokenResponseDto>.FailureResponse("Invalid or expired refresh token.", 401);
        }

        var expiryTime = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes);

        _logger.LogInformation("Generating new JWT tokens for UserId: {UserId}", user.Id);

        var newAccessToken = _jwtService.GenerateAccessToken(user, expiryTime);
        var newRefreshToken = _jwtService.GenerateRefreshToken(user);

        _logger.LogInformation("Token refreshed successfully for UserId: {UserId}", user.Id);

        var refreshDto = new RefreshTokenResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiry = expiryTime
        };

        return ApiResponse<RefreshTokenResponseDto>.SuccessResponse(refreshDto, "Token refreshed successfully.", 200);
    }

    /// <summary>
    /// Registers a new tenant and an associated tenant admin user.
    /// </summary>
    public async Task<ApiResponse<string>> RegisterTenantAsync(RegisterTenantRequestDto request)
    {
        _logger.LogInformation("Processing tenant registration for CIN: {Cin}", request.Cin);

        // Normalization
        var normalizedEmail = request.Email?.Trim().ToLowerInvariant();
        var normalizedCin = request.Cin?.Trim().ToUpperInvariant();
        
        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail!);
        if (existingUser != null)
        {
            return ApiResponse<string>.FailureResponse("User with this email already exists.", 400);
        }

        var existingTenant = await _tenantRepository.GetByCinAsync(normalizedCin!);
        if (existingTenant != null)
        {
            return ApiResponse<string>.FailureResponse("Tenant with this CIN already exists.", 400);
        }

        string CapitalizeFirst(string? s) => string.IsNullOrWhiteSpace(s) ? string.Empty : char.ToUpper(s[0]) + s.Substring(1).ToLowerInvariant();

        // 1. Create Tenant
        var tenant = new Tenant
        {
            CIN = normalizedCin!,
            CompanyName = request.CompanyName?.Trim().ToUpperInvariant() ?? string.Empty,
            Address = request.Address?.Trim(),
            Pincode = request.Pincode?.Trim(),
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        // 2. Create User linked to Tenant
        var user = new User
        {
            Email = normalizedEmail!,
            FirstName = CapitalizeFirst(request.FirstName),
            LastName = CapitalizeFirst(request.LastName),
            PhoneNumber = request.PhoneNumber?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = Role.Tenant,
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow,
            Tenant = tenant // Navigation property linkage for implicit transaction
        };

        await _tenantRepository.AddAsync(tenant);
        await _userRepository.AddAsync(user);

        // Saves both entities transactionally because EF Core SaveChanges is implicitly a transaction
        await _userRepository.SaveChangesAsync();

        _logger.LogInformation("Successfully registered tenant {CompanyName} and user {Email}.", tenant.CompanyName, user.Email);

        return ApiResponse<string>.SuccessResponse("Tenant registered successfully", "Tenant registered successfully.", 201);
    }
}
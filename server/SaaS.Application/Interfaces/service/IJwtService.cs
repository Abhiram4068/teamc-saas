using System.Security.Claims;
using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Service;

public interface IJwtService
{
    /// <summary>
    /// Generates a JWT access token for a user.
    /// </summary>
    /// <param name="user">The user entity for whom token is created.</param>
    /// <param name="expiry">The token expiration date and time.</param>
    /// <returns>A signed JWT access token string.</returns>
    string GenerateAccessToken(User user, DateTime expiry);

    /// <summary>
    /// Generates a long-lived JWT refresh token for a user.
    /// </summary>
    /// <param name="user">The user entity for whom token is created.</param>
    /// <returns>A signed JWT refresh token string.</returns>
    string GenerateRefreshToken(User user);

    /// <summary>
    /// Validates a refresh token JWT and returns its ClaimsPrincipal if valid and of type refresh.
    /// </summary>
    /// <param name="refreshToken">The refresh token string to validate.</param>
    /// <returns>A <see cref="ClaimsPrincipal"/> if valid; otherwise, <c>null</c>.</returns>
    ClaimsPrincipal? ValidateRefreshToken(string refreshToken);
}

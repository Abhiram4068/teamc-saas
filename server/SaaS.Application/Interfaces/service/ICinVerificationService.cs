namespace SaaS.Application.Interfaces.Service;

public interface ICinVerificationService
{
    /// <summary>
    /// Verifies the provided Corporate Identification Number (CIN) against an external registry.
    /// Returns the company name if valid, or null if not found.
    /// </summary>
    /// <param name="cin">The CIN to verify.</param>
    /// <returns>The company name or null.</returns>
    Task<string?> VerifyCinAsync(string cin);
}

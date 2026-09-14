using SaaS.Application.DTOs.Common;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using System.Text.Json;

namespace SaaS.Infrastructure.Services;

public class CinVerificationService : ICinVerificationService
{
    private readonly string _mockJsonFilePath;
    private readonly ITenantRepository _tenantRepository;

    public CinVerificationService(ITenantRepository tenantRepository)
    {
        // Path to the mock JSON file relative to the execution directory
        _mockJsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "Mocks", "cin_registry.json");
        _tenantRepository = tenantRepository;
    }

    public async Task<ApiResponse<string>> VerifyCinAsync(string cin)
    {
        if (string.IsNullOrWhiteSpace(cin))
            return ApiResponse<string>.FailureResponse("CIN is required.", 400);

        var existingTenant = await _tenantRepository.GetByCinAsync(cin!);
        if (existingTenant != null)
        {
            return ApiResponse<string>.FailureResponse("Tenant with this CIN already exists.", 400);
        }

        // In a real application, this would make an HTTP call to an external MCA API.
        // For now, we mock the behavior by reading from a JSON file.

        // Ensure path exists in case we run from a different directory structure (e.g. tests or EF migrations)
        var fallbackPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "Mocks", "cin_registry.json");
        
        string jsonContent = string.Empty;

        if (File.Exists(_mockJsonFilePath))
        {
            jsonContent = await File.ReadAllTextAsync(_mockJsonFilePath);
        }
        else if (File.Exists(fallbackPath))
        {
            jsonContent = await File.ReadAllTextAsync(fallbackPath);
        }
        else
        {
            // If the file is completely missing, we just simulate a not found for safety
            return ApiResponse<string>.FailureResponse("Registry unavailable.", 500);
        }

        try
        {
            var registry = JsonSerializer.Deserialize<List<CinRegistryEntry>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            var match = registry?.FirstOrDefault(x => x.Cin.Equals(cin, StringComparison.OrdinalIgnoreCase));
            
            if (match != null && !string.IsNullOrWhiteSpace(match.CompanyName))
            {
                return ApiResponse<string>.SuccessResponse(match.CompanyName);
            }
            
            return ApiResponse<string>.FailureResponse("Entered CIN not found.", 404);
        }
        catch
        {
            // Catch JSON parsing errors and just return not found
            return ApiResponse<string>.FailureResponse("Failed to verify CIN.", 500);
        }
    }

    private class CinRegistryEntry
    {
        public string Cin { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }
}

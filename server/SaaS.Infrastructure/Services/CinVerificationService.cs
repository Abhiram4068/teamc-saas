using System.Text.Json;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Infrastructure.Services;

public class CinVerificationService : ICinVerificationService
{
    private readonly string _mockJsonFilePath;

    public CinVerificationService()
    {
        // Path to the mock JSON file relative to the execution directory
        _mockJsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "Mocks", "cin_registry.json");
    }

    public async Task<string?> VerifyCinAsync(string cin)
    {
        if (string.IsNullOrWhiteSpace(cin))
            return null;

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
            return null;
        }

        try
        {
            var registry = JsonSerializer.Deserialize<List<CinRegistryEntry>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            var match = registry?.FirstOrDefault(x => x.Cin.Equals(cin, StringComparison.OrdinalIgnoreCase));
            
            return match?.CompanyName;
        }
        catch
        {
            // Catch JSON parsing errors and just return null as if it wasn't found
            return null;
        }
    }

    private class CinRegistryEntry
    {
        public string Cin { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }
}

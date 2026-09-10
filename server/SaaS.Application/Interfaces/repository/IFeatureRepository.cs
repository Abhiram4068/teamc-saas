using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

/// <summary>
/// Repository interface for <see cref="Feature"/> persistence operations.
/// </summary>
public interface IFeatureRepository
{
    Task<Feature?> GetByIdAsync(int id);
    Task<Feature?> GetByCodeAsync(string code);
    Task<bool> ExistsByCodeAsync(string code);
    Task AddAsync(Feature feature);
    Task SaveChangesAsync();    
    Task<(IEnumerable<Feature> Items, int TotalCount)> GetFeaturesAsync(string? searchTerm, SaaS.Domain.Enums.FeatureStatus? status, int pageNumber, int pageSize);
}

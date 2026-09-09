using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for <see cref="Feature"/> database operations.
/// </summary>
public class FeatureRepository : IFeatureRepository
{
    private readonly AppDbContext _context;

    public FeatureRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Feature?> GetByIdAsync(int id)
    {
        return await _context.Features.FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Feature?> GetByCodeAsync(string code)
    {
        return await _context.Features.FirstOrDefaultAsync(f => f.Code.ToLower() == code.ToLower());
    }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _context.Features.AnyAsync(f => f.Code.ToLower() == code.ToLower());
    }

    public async Task AddAsync(Feature feature)
    {
        await _context.Features.AddAsync(feature);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<(IEnumerable<Feature> Items, int TotalCount)> GetFeaturesAsync(string? searchTerm, SaaS.Domain.Enums.FeatureStatus? status, int pageNumber, int pageSize)
    {
        var query = _context.Features.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerTerm = searchTerm.ToLower();
            query = query.Where(f => f.Code.ToLower().Contains(lowerTerm) || 
                                     f.Name.ToLower().Contains(lowerTerm));
        }

        if (status.HasValue)
        {
            query = query.Where(f => f.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(f => f.CreatedAt) 
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}

using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class PlanRepository : IPlanRepository
{
    private readonly AppDbContext _context;

    public PlanRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Plan?> GetByIdAsync(int id)
    {
        return await _context.Plans.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Plan?> GetByCodeAsync(string code)
    {
        return await _context.Plans.FirstOrDefaultAsync(p => p.Code.ToLower() == code.ToLower());
    }

    public async Task<bool> ExistsByCodeAsync(string code)
    {
        return await _context.Plans.AnyAsync(p => p.Code.ToLower() == code.ToLower());
    }
    
    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Plans.AnyAsync(p => p.Name.ToLower() == name.ToLower());
    }

    public async Task AddAsync(Plan plan)
    {
        await _context.Plans.AddAsync(plan);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<(IEnumerable<Plan> Items, int TotalCount)> GetPlansAsync(string? searchTerm, SaaS.Domain.Enums.PlanStatus? status, int pageNumber, int pageSize)
    {
        var query = _context.Plans.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerTerm = searchTerm.ToLower();
            query = query.Where(p => p.Code.ToLower().Contains(lowerTerm) || 
                                     p.Name.ToLower().Contains(lowerTerm));
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt) 
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}

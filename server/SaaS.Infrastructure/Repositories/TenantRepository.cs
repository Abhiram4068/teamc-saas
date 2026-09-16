using Microsoft.EntityFrameworkCore;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly AppDbContext _context;

    public TenantRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Tenant?> GetByCinAsync(string cin)
    {
        return await _context.Tenants.FirstOrDefaultAsync(t => t.CIN == cin);
    }

    public async Task<Tenant?> GetByIdAsync(long id)
    {
        return await _context.Tenants.FindAsync(id);
    }

    public async Task AddAsync(Tenant tenant)
    {
        await _context.Tenants.AddAsync(tenant);
    }

    public async Task<(IEnumerable<Tenant> Tenants, int TotalCount)> GetPaginatedTenantsAsync(TenantQueryRequestDto query)
    {
        var dbQuery = _context.Tenants
            .Include(t => t.Users)
            .AsQueryable();

        if (query.Status.HasValue)
        {
            dbQuery = dbQuery.Where(t => t.Status == query.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.ToLower();
            dbQuery = dbQuery.Where(t => 
                t.CompanyName.ToLower().Contains(search) ||
                t.Users.Any(u => u.Role == Role.Tenant && (
                    (u.FirstName + " " + u.LastName).ToLower().Contains(search) ||
                    u.FirstName.ToLower().Contains(search) ||
                    u.LastName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(search))
                ))
            );
        }

        var totalCount = await dbQuery.CountAsync();

        var tenants = await dbQuery
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return (tenants, totalCount);
    }
}

using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
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
}

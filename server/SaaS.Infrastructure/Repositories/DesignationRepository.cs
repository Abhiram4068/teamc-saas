using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class DesignationRepository : IDesignationRepository
{
    private readonly AppDbContext _context;

    public DesignationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Designation>> GetByDepartmentIdAsync(int departmentId)
    {
        return await _context.Designations
            .Where(d => d.DepartmentId == departmentId && d.IsActive)
            .ToListAsync();
    }

    public async Task<Designation?> GetByIdAsync(int id)
    {
        return await _context.Designations
            .FirstOrDefaultAsync(d => d.Id == id);
    }
}

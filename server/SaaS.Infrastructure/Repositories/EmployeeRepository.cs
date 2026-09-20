using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _context;

    public EmployeeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Employee employee)
    {
        await _context.Set<Employee>().AddAsync(employee);
        // Note: SaveChanges is typically called via a UnitOfWork or explicitly by the service/caller
    }

    public async Task<Employee?> GetByIdAsync(long id)
    {
        return await _context.Set<Employee>()
            .Include(e => e.User)
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<(IEnumerable<Employee> Items, int TotalCount)> GetEmployeesAsync(int tenantId, SaaS.Application.DTOs.Requests.GetEmployeesRequestDto request)
    {
        var query = _context.Set<Employee>()
            .Include(e => e.User)
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Where(e => e.TenantId == tenantId && e.User.Status != SaaS.Domain.Enums.UserStatus.Deleted);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower().Trim();
            query = query.Where(e => 
                e.User.FirstName.ToLower().Contains(search) || 
                e.User.LastName.ToLower().Contains(search) ||
                (e.User.FirstName + " " + e.User.LastName).ToLower().Contains(search) ||
                e.User.Email.ToLower().Contains(search) ||
                (e.User.PhoneNumber != null && e.User.PhoneNumber.Contains(search))
            );
        }

        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var sort = request.SortBy.ToLower().Trim();
            if (sort == "department")
            {
                query = request.SortDescending 
                    ? query.OrderByDescending(e => e.Department != null ? e.Department.Name : string.Empty)
                    : query.OrderBy(e => e.Department != null ? e.Department.Name : string.Empty);
            }
            else if (sort == "designation")
            {
                query = request.SortDescending 
                    ? query.OrderByDescending(e => e.Designation != null ? e.Designation.Name : string.Empty)
                    : query.OrderBy(e => e.Designation != null ? e.Designation.Name : string.Empty);
            }
            else if (sort == "role")
            {
                query = request.SortDescending 
                    ? query.OrderByDescending(e => e.User.Role)
                    : query.OrderBy(e => e.User.Role);
            }
            else
            {
                query = request.SortDescending ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id);
            }
        }
        else
        {
            query = request.SortDescending ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}

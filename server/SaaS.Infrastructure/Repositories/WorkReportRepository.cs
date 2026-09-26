using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Repositories;

public class WorkReportRepository : IWorkReportRepository
{
    private readonly AppDbContext _context;

    public WorkReportRepository(AppDbContext context)
    {
        _context = context;
    }

    // --- Work Reports ---

    public async Task<WorkReport?> GetByIdAsync(long id, long tenantId) =>
        await _context.WorkReports
            .Include(r => r.WorkType)
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId);

    public async Task<(IEnumerable<WorkReport> Items, int TotalCount)> GetByUserIdAsync(long userId, long tenantId, SaaS.Application.DTOs.Requests.WorkReportQueryRequestDto request)
    {
        var query = _context.WorkReports
            .Include(r => r.WorkType)
            .Where(r => r.UserId == userId && r.TenantId == tenantId);
            
        // Search
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower().Trim();
            query = query.Where(r => 
                r.Description.ToLower().Contains(search) ||
                (r.WorkType != null && r.WorkType.Name.ToLower().Contains(search))
            );
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var sort = request.SortBy.ToLower().Trim();
            if (sort == "workdate")
                query = request.SortDescending ? query.OrderByDescending(r => r.WorkDate) : query.OrderBy(r => r.WorkDate);
            else if (sort == "hoursspent")
                query = request.SortDescending ? query.OrderByDescending(r => r.HoursSpent) : query.OrderBy(r => r.HoursSpent);
            else if (sort == "worktype")
                query = request.SortDescending ? query.OrderByDescending(r => r.WorkType.Name) : query.OrderBy(r => r.WorkType.Name);
            else
                query = request.SortDescending ? query.OrderByDescending(r => r.Id) : query.OrderBy(r => r.Id);
        }
        else
        {
            query = query.OrderByDescending(r => r.WorkDate);
        }

        var totalCount = await query.CountAsync();
        
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();
            
        return (items, totalCount);
    }

    public async Task<bool> HasSubmittedReportAsync(long userId, long tenantId, DateTime date)
    {
        return await _context.WorkReports.AnyAsync(r => 
            r.UserId == userId && 
            r.TenantId == tenantId && 
            r.WorkDate.Date == date.Date && 
            r.Status == SaaS.Domain.Enums.WorkReportStatus.Submitted);
    }

    public async Task<(IEnumerable<WorkReport> Items, int TotalCount)> GetTeamReportsAsync(long managerUserId, long tenantId, SaaS.Application.DTOs.Requests.WorkReportQueryRequestDto request)
    {
        var managerEmployee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == managerUserId && e.TenantId == tenantId);

        if (managerEmployee == null) return (Enumerable.Empty<WorkReport>(), 0);

        var teamUserIds = await _context.Employees
            .Where(e => e.ReportingManagerId == managerEmployee.Id && e.TenantId == tenantId)
            .Select(e => e.UserId)
            .ToListAsync();
            
        teamUserIds.Add(managerUserId);

        if (request.TargetUserId.HasValue)
        {
            if (!teamUserIds.Contains(request.TargetUserId.Value))
            {
                return (Enumerable.Empty<WorkReport>(), 0);
            }
            teamUserIds = new List<long> { request.TargetUserId.Value };
        }

        var query = _context.WorkReports
            .Include(r => r.WorkType)
            .Include(r => r.User)
            .Where(r => teamUserIds.Contains(r.UserId) && r.TenantId == tenantId && r.Status == WorkReportStatus.Submitted);
            
        // Search
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower().Trim();
            query = query.Where(r => 
                r.Description.ToLower().Contains(search) ||
                (r.WorkType != null && r.WorkType.Name.ToLower().Contains(search)) ||
                (r.User != null && (r.User.FirstName.ToLower().Contains(search) || r.User.LastName.ToLower().Contains(search) || r.User.Email.ToLower().Contains(search)))
            );
        }

        // Sort
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            var sort = request.SortBy.ToLower().Trim();
            if (sort == "workdate")
                query = request.SortDescending ? query.OrderByDescending(r => r.WorkDate) : query.OrderBy(r => r.WorkDate);
            else if (sort == "hoursspent")
                query = request.SortDescending ? query.OrderByDescending(r => r.HoursSpent) : query.OrderBy(r => r.HoursSpent);
            else if (sort == "worktype")
                query = request.SortDescending ? query.OrderByDescending(r => r.WorkType.Name) : query.OrderBy(r => r.WorkType.Name);
            else if (sort == "employee")
                query = request.SortDescending ? query.OrderByDescending(r => r.User.FirstName) : query.OrderBy(r => r.User.FirstName);
            else
                query = request.SortDescending ? query.OrderByDescending(r => r.Id) : query.OrderBy(r => r.Id);
        }
        else
        {
            query = query.OrderByDescending(r => r.WorkDate);
        }

        var totalCount = await query.CountAsync();
        
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();
            
        return (items, totalCount);
    }

    public async Task AddAsync(WorkReport workReport)
    {
        _context.WorkReports.Add(workReport);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(IEnumerable<WorkReport> workReports)
    {
        await _context.WorkReports.AddRangeAsync(workReports);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(WorkReport workReport)
    {
        _context.WorkReports.Update(workReport);
        await _context.SaveChangesAsync();
    }

    // --- Work Types ---

    public async Task<WorkType?> GetWorkTypeByIdAsync(int id, long tenantId) =>
        await _context.WorkTypes.FirstOrDefaultAsync(w => w.Id == id && w.TenantId == tenantId);

    public async Task<WorkType?> GetWorkTypeByNameAsync(string name, long tenantId) =>
        await _context.WorkTypes.FirstOrDefaultAsync(w => w.Name == name && w.TenantId == tenantId);

    public async Task<IEnumerable<WorkType>> GetAllActiveWorkTypesAsync(long tenantId) =>
        await _context.WorkTypes.Where(w => w.TenantId == tenantId && w.IsActive).ToListAsync();

    public async Task<IEnumerable<WorkType>> GetAllWorkTypesAsync(long tenantId) =>
        await _context.WorkTypes.Where(w => w.TenantId == tenantId).ToListAsync();

    public async Task AddWorkTypeAsync(WorkType workType)
    {
        _context.WorkTypes.Add(workType);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateWorkTypeAsync(WorkType workType)
    {
        _context.WorkTypes.Update(workType);
        await _context.SaveChangesAsync();
    }
}

using Microsoft.EntityFrameworkCore;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;

public class LeaveRepository : ILeaveRepository
{
    private readonly AppDbContext _context;

    public LeaveRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LeaveType>> GetLeaveTypesAsync(long tenantId)
    {
        return await _context.LeaveTypes
            .Where(lt => lt.TenantId == tenantId && lt.IsActive)
            .ToListAsync();
    }

    public async Task<LeaveType?> GetLeaveTypeByIdAsync(long tenantId, int leaveTypeId)
    {
        return await _context.LeaveTypes
            .FirstOrDefaultAsync(lt => lt.TenantId == tenantId && lt.Id == leaveTypeId && lt.IsActive);
    }

    public async Task AddLeaveTypeAsync(LeaveType leaveType)
    {
        await _context.LeaveTypes.AddAsync(leaveType);
    }

    public Task UpdateLeaveTypeAsync(LeaveType leaveType)
    {
        _context.LeaveTypes.Update(leaveType);
        return Task.CompletedTask;
    }

    public Task DeleteLeaveTypeAsync(LeaveType leaveType)
    {
        _context.LeaveTypes.Remove(leaveType);
        return Task.CompletedTask;
    }

    public async Task<(IEnumerable<User> users, IEnumerable<EmployeeLeaveBalance> balances, int totalCount)> GetEmployeesWithLeaveBalancesAsync(long tenantId, LeaveBalanceQueryRequestDto queryDto)
    {
        var query = _context.Users
            .Include(u => u.Employee)
                .ThenInclude(e => e.Designation)
            .Where(u => u.TenantId == tenantId && u.Status != SaaS.Domain.Enums.UserStatus.Deleted && 
                        (u.Role == SaaS.Domain.Enums.Role.Employee || u.Role == SaaS.Domain.Enums.Role.Manager || u.Role == SaaS.Domain.Enums.Role.Hr));

        if (!string.IsNullOrWhiteSpace(queryDto.Search))
        {
            var s = queryDto.Search.ToLower();
            query = query.Where(u => 
                u.FirstName.ToLower().Contains(s) || 
                u.LastName.ToLower().Contains(s) || 
                u.Email.ToLower().Contains(s));
        }

        if (queryDto.DesignationId.HasValue)
        {
            query = query.Where(u => u.Employee != null && u.Employee.DesignationId == queryDto.DesignationId.Value);
        }

        // Sorting
        query = queryDto.SortBy?.ToLower() switch
        {
            "name" => queryDto.SortDescending 
                ? query.OrderByDescending(u => u.FirstName).ThenByDescending(u => u.LastName)
                : query.OrderBy(u => u.FirstName).ThenBy(u => u.LastName),
            _ => query.OrderBy(u => u.FirstName).ThenBy(u => u.LastName)
        };

        var totalCount = await query.CountAsync();
        
        var users = await query
            .Skip((queryDto.PageNumber - 1) * queryDto.PageSize)
            .Take(queryDto.PageSize)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();
        
        var balances = await _context.EmployeeLeaveBalances
            .Include(elb => elb.LeaveType)
            .Where(elb => elb.TenantId == tenantId && userIds.Contains(elb.EmployeeId))
            .ToListAsync();

        return (users, balances, totalCount);
    }

    public async Task<IEnumerable<EmployeeLeaveBalance>> GetLeaveBalancesByEmployeeIdAsync(long tenantId, long employeeId)
    {
        return await _context.EmployeeLeaveBalances
            .Include(elb => elb.LeaveType)
            .Where(elb => elb.TenantId == tenantId && elb.EmployeeId == employeeId)
            .ToListAsync();
    }

    public async Task<EmployeeLeaveBalance?> GetLeaveBalanceAsync(long tenantId, long employeeId, int leaveTypeId, int year)
    {
        return await _context.EmployeeLeaveBalances
            .FirstOrDefaultAsync(elb => elb.TenantId == tenantId && elb.EmployeeId == employeeId && elb.LeaveTypeId == leaveTypeId && elb.Year == year);
    }

    public async Task<EmployeeLeaveBalance?> GetLeaveBalanceByIdAsync(long tenantId, int id)
    {
        return await _context.EmployeeLeaveBalances
            .Include(elb => elb.Employee)
            .Include(elb => elb.LeaveType)
            .FirstOrDefaultAsync(elb => elb.TenantId == tenantId && elb.Id == id);
    }

    public async Task AddLeaveBalanceAsync(EmployeeLeaveBalance balance)
    {
        await _context.EmployeeLeaveBalances.AddAsync(balance);
    }

    public async Task UpdateLeaveBalanceAsync(EmployeeLeaveBalance balance)
    {
        _context.EmployeeLeaveBalances.Update(balance);
        await Task.CompletedTask;
    }

    public async Task AddLeaveRequestAsync(LeaveRequest request)
    {
        request.CreatedAt = DateTime.UtcNow;
        await _context.LeaveRequests.AddAsync(request);
    }

    public async Task<(IEnumerable<LeaveRequest> Requests, int TotalCount)> GetLeaveRequestsByEmployeeIdAsync(long tenantId, long employeeId, int pageNumber, int pageSize)
    {
        var query =  _context.LeaveRequests
            .Include(lr => lr.LeaveType)
            .Where(lr => lr.TenantId == tenantId && lr.EmployeeId == employeeId);

        var totalCount = await query.CountAsync();
        
        var requests = await query
            .OrderByDescending(lr => lr.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (requests, totalCount);
    }

    public async Task<(IEnumerable<LeaveRequest> Requests, int TotalCount)> GetTeamLeaveRequestsAsync(long tenantId, long managerUserId, int pageNumber, int pageSize)
    {
        var query = _context.LeaveRequests
            .Include(lr => lr.LeaveType)
            .Include(lr => lr.Employee)
            .Where(lr => lr.TenantId == tenantId && lr.ManagerId == managerUserId);

        var totalCount = await query.CountAsync();
        
        var requests = await query
            .OrderByDescending(lr => lr.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (requests, totalCount);
    }

    public async Task<LeaveRequest?> GetLeaveRequestByIdAsync(long tenantId, int requestId)
    {
        return await _context.LeaveRequests
            .FirstOrDefaultAsync(lr => lr.TenantId == tenantId && lr.Id == requestId);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

using SaaS.Application.DTOs.Requests;
using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface ILeaveRepository
{
    // Leave Type
    Task<IEnumerable<LeaveType>> GetLeaveTypesAsync(long tenantId);
    Task<LeaveType?> GetLeaveTypeByIdAsync(long tenantId, int leaveTypeId);
    Task AddLeaveTypeAsync(LeaveType leaveType);
    Task UpdateLeaveTypeAsync(LeaveType leaveType);
    Task DeleteLeaveTypeAsync(LeaveType leaveType);

    // Employee Leave Balance
    Task<(IEnumerable<User> users, IEnumerable<EmployeeLeaveBalance> balances, int totalCount)> GetEmployeesWithLeaveBalancesAsync(long tenantId, LeaveBalanceQueryRequestDto query);
    Task<IEnumerable<EmployeeLeaveBalance>> GetLeaveBalancesByEmployeeIdAsync(long tenantId, long employeeId);
    Task<EmployeeLeaveBalance?> GetLeaveBalanceAsync(long tenantId, long employeeId, int leaveTypeId, int year);
    Task<EmployeeLeaveBalance?> GetLeaveBalanceByIdAsync(long tenantId, int id);
    Task AddLeaveBalanceAsync(EmployeeLeaveBalance balance);
    Task UpdateLeaveBalanceAsync(EmployeeLeaveBalance balance);

    Task AddLeaveRequestAsync(LeaveRequest request);
    Task<(IEnumerable<LeaveRequest> Requests, int TotalCount)> GetLeaveRequestsByEmployeeIdAsync(long tenantId, long employeeId, int pageNumber, int pageSize);
    Task<(IEnumerable<LeaveRequest> Requests, int TotalCount)> GetTeamLeaveRequestsAsync(long tenantId, long managerUserId, int pageNumber, int pageSize);
    Task<LeaveRequest?> GetLeaveRequestByIdAsync(long tenantId, int requestId);

    Task SaveChangesAsync();
}

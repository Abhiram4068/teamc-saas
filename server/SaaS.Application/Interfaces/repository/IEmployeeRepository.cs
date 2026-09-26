using SaaS.Domain.Entities;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Interfaces.Repository;

public interface IEmployeeRepository
{
    Task AddAsync(Employee employee);
    Task<Employee?> GetByIdAsync(long id);
    Task<Employee?> GetByUserIdAsync(long userId);
    Task<(IEnumerable<Employee> Items, int TotalCount)> GetEmployeesAsync(int tenantId, GetEmployeesRequestDto request);
    
    // Dashboard Stats
    Task<int> GetTotalCountAsync(int tenantId);
    Task<int> GetManagerCountAsync(int tenantId);
    Task<int> GetDirectReportsCountAsync(long employeeId);
}

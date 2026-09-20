using SaaS.Domain.Entities;
using SaaS.Application.DTOs.Requests;

namespace SaaS.Application.Interfaces.Repository;

public interface IEmployeeRepository
{
    Task AddAsync(Employee employee);
    Task<Employee?> GetByIdAsync(long id);
    Task<(IEnumerable<Employee> Items, int TotalCount)> GetEmployeesAsync(int tenantId, GetEmployeesRequestDto request);
}

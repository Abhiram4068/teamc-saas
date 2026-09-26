using SaaS.Application.DTOs.Response;

namespace SaaS.Application.Interfaces.Service;

public interface IDepartmentService
{
    Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
    Task<IEnumerable<DesignationDto>> GetDesignationsByDepartmentIdAsync(int departmentId);
}

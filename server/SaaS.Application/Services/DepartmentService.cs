using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IDesignationRepository _designationRepository;

    public DepartmentService(
        IDepartmentRepository departmentRepository,
        IDesignationRepository designationRepository)
    {
        _departmentRepository = departmentRepository;
        _designationRepository = designationRepository;
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
    {
        var departments = await _departmentRepository.GetAllActiveAsync();
        return departments.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            Code = d.Code,
            Description = d.Description
        });
    }

    public async Task<IEnumerable<DesignationDto>> GetDesignationsByDepartmentIdAsync(int departmentId)
    {
        var designations = await _designationRepository.GetByDepartmentIdAsync(departmentId);
        return designations.Select(d => new DesignationDto
        {
            Id = d.Id,
            DepartmentId = d.DepartmentId,
            Name = d.Name,
            Description = d.Description
        });
    }
}

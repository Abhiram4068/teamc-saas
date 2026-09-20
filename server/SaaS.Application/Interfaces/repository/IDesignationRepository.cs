using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IDesignationRepository
{
    Task<IEnumerable<Designation>> GetByDepartmentIdAsync(int departmentId);
    Task<Designation?> GetByIdAsync(int id);
}

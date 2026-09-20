using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IDepartmentRepository
{
    Task<IEnumerable<Department>> GetAllActiveAsync();
    Task<Department?> GetByIdAsync(int id);
}

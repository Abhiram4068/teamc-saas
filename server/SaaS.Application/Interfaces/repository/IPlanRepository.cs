using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IPlanRepository
{
    Task<Plan?> GetByIdAsync(int id);
    Task<Plan?> GetByCodeAsync(string code);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> ExistsByNameAsync(string name);
    Task AddAsync(Plan plan);
    Task SaveChangesAsync();
    
    Task<(IEnumerable<Plan> Items, int TotalCount)> GetPlansAsync(string? searchTerm, SaaS.Domain.Enums.PlanStatus? status, int pageNumber, int pageSize);
}

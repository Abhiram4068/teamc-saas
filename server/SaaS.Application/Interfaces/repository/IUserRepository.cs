using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(long id);
    Task<int> GetCountByRoleAsync(long tenantId);
    Task<IEnumerable<User>> GetTenantAdminsAsync(long tenantId);
    Task<IEnumerable<User>> GetUsersByRoleAsync(SaaS.Domain.Enums.Role role, long? tenantId = null);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task SaveChangesAsync();
}
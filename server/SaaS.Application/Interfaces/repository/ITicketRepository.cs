using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface ITicketRepository
{
    Task<Ticket?> GetByIdAsync(long id);
    Task<IEnumerable<Ticket>> GetByRaisedByEmailAsync(string email);
    Task<IEnumerable<Ticket>> GetByAssignedToEmailAsync(string email);
    Task<(IEnumerable<Ticket> Tickets, int TotalCount)> GetByAssignedToEmailPagedAsync(string email, string? status, string? search, int pageNumber, int pageSize);
    Task<IEnumerable<Ticket>> GetByTenantIdAsync(long tenantId);
    Task AddAsync(Ticket ticket);
    Task AddReplyAsync(TicketReply reply);
    Task UpdateAsync(Ticket ticket);
    Task SaveChangesAsync();
}

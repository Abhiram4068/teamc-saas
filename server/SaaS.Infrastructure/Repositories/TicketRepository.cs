using Microsoft.EntityFrameworkCore;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Entities;
using SaaS.Infrastructure.Data;
using SaaS.Application.DTOs.Response;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Ticket?> GetByIdAsync(long id)
    {
        return await _context.Tickets
            .Include(t => t.Replies)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Ticket>> GetByRaisedByEmailAsync(string email)
    {
        return await _context.Tickets
            .Where(t => t.RaisedByEmail == email)
            .Include(t => t.Replies)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByAssignedToEmailAsync(string email)
    {
        return await _context.Tickets
            .Where(t => t.AssignedToEmail == email)
            .Include(t => t.Replies)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<(IEnumerable<Ticket> Tickets, int TotalCount)> GetByAssignedToEmailPagedAsync(string email, string? status, string? search, int pageNumber, int pageSize)
    {
        var query = _context.Tickets.Where(t => t.AssignedToEmail == email);

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusLower = status.ToLower();
            int? statusVal = statusLower switch
            {
                "open" => 1,
                "solved" => 2,
                "escalated" => 3,
                "closed" => 4,
                _ => null
            };
            
            if (statusVal.HasValue)
            {
                query = query.Where(t => (int)t.Status == statusVal.Value);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(t => 
                t.Subject.ToLower().Contains(searchLower) || 
                t.Description.ToLower().Contains(searchLower) || 
                t.RaisedByEmail.ToLower().Contains(searchLower) ||
                t.Id.ToString().Contains(searchLower) ||
                t.CreatedAt.ToString().Contains(searchLower));
        }

        var totalCount = await query.CountAsync();

        var tickets = await query
            .Include(t => t.Replies)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (tickets, totalCount);
    }

    public async Task<IEnumerable<Ticket>> GetByTenantIdAsync(long tenantId)
    {
        return await _context.Tickets
            .Where(t => t.TenantId == tenantId)
            .Include(t => t.Replies)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Ticket ticket)
    {
        await _context.Tickets.AddAsync(ticket);
    }

    public async Task AddReplyAsync(TicketReply reply)
    {
        await _context.TicketReplies.AddAsync(reply);
    }

    public Task UpdateAsync(Ticket ticket)
    {
        _context.Tickets.Update(ticket);
        return Task.CompletedTask;
    }

    public async Task<TicketDashboardResponseDto> GetDashboardStatsAsync(string email)
    {
        var totalAssigned = await _context.Tickets.CountAsync(t => t.AssignedToEmail == email);
        var escalated = await _context.Tickets.CountAsync(t => t.AssignedToEmail == email && t.Status == TicketStatus.Escalated);
        var open = await _context.Tickets.CountAsync(t => t.AssignedToEmail == email && t.Status == TicketStatus.Open);
        var closed = await _context.Tickets.CountAsync(t => t.AssignedToEmail == email && t.Status == TicketStatus.Closed);
        var raisedByMe = await _context.Tickets.CountAsync(t => t.RaisedByEmail == email);

        return new TicketDashboardResponseDto
        {
            TotalTickets = totalAssigned,
            Escalated = escalated,
            Open = open,
            Closed = closed,
            RaisedByMe = raisedByMe
        };
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

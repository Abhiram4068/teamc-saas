using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Service;

public interface IEmailService
{
    Task SendTicketEmailAsync(string toEmail, string type, Ticket ticket);
}

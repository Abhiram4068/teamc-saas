using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendTicketEmailAsync(string toEmail, string type, Ticket ticket)
    {
        try
        {
            var host = _configuration["EmailSettings:Host"];
            var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];
            var fromName = _configuration["EmailSettings:FromName"] ?? "Teamo Support";
            var fromEmail = _configuration["EmailSettings:FromEmail"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username))
            {
                _logger.LogWarning("Email settings are not configured. Skipping email.");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail ?? username));
            message.To.Add(new MailboxAddress("", toEmail));

            var bodyBuilder = new BodyBuilder();
            
            switch (type.ToLower())
            {
                case "created":
                    message.Subject = $"Ticket Created: {ticket.Subject} [#{ticket.Id}]";
                    bodyBuilder.HtmlBody = $@"
                        <h3>Hello,</h3>
                        <p>Your ticket <strong>#{ticket.Id}</strong> has been successfully created.</p>
                        <p><strong>Subject:</strong> {ticket.Subject}</p>
                        <p><strong>Category:</strong> {ticket.Category}</p>
                        <p><strong>Priority:</strong> {ticket.Priority}</p>
                        <br/>
                        <p>We will review it and get back to you shortly.</p>
                        <p>Thanks,<br/>Support Team</p>";
                    break;
                case "escalated":
                    message.Subject = $"Ticket Escalated: {ticket.Subject} [#{ticket.Id}]";
                    bodyBuilder.HtmlBody = $@"
                        <h3>Hello,</h3>
                        <p>Ticket <strong>#{ticket.Id}</strong> has been escalated.</p>
                        <p><strong>Subject:</strong> {ticket.Subject}</p>
                        <p><strong>Priority:</strong> {ticket.Priority}</p>
                        <br/>
                        <p>The support team is prioritizing this issue.</p>
                        <p>Thanks,<br/>Support Team</p>";
                    break;
                case "closed":
                    message.Subject = $"Ticket Closed: {ticket.Subject} [#{ticket.Id}]";
                    bodyBuilder.HtmlBody = $@"
                        <h3>Hello,</h3>
                        <p>Your ticket <strong>#{ticket.Id}</strong> has been closed.</p>
                        <p><strong>Subject:</strong> {ticket.Subject}</p>
                        <br/>
                        <p>If you have any further questions, please feel free to open a new ticket.</p>
                        <p>Thanks,<br/>Support Team</p>";
                    break;
                default:
                    message.Subject = $"Ticket Update: {ticket.Subject} [#{ticket.Id}]";
                    bodyBuilder.HtmlBody = $@"
                        <h3>Hello,</h3>
                        <p>There has been an update to your ticket <strong>#{ticket.Id}</strong>.</p>
                        <p><strong>Subject:</strong> {ticket.Subject}</p>
                        <br/>
                        <p>Thanks,<br/>Support Team</p>";
                    break;
            }

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            _logger.LogInformation("Successfully sent {Type} ticket email to {Email}", type, toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send ticket email to {Email}", toEmail);
        }
    }
}

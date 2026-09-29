using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Domain.Enums;

namespace SaaS.Application.Interfaces.Service;

public interface ITicketService
{
    Task<ApiResponse<TicketResponseDto>> CreateTicketAsync(CreateTicketRequestDto dto, string userEmail, Role userRole, long? tenantId);
    Task<ApiResponse<List<TicketResponseDto>>> GetMyTicketsAsync(string email);
    Task<ApiResponse<List<TicketResponseDto>>> GetAssignedTicketsAsync(string email);
    Task<ApiResponse<PagedResponseDto<TicketResponseDto>>> GetAssignedTicketsPagedAsync(string email, string? status, string? search, int pageNumber, int pageSize);
    Task<ApiResponse<List<TicketResponseDto>>> GetTenantTicketsAsync(long tenantId);
    Task<ApiResponse<TicketDetailsResponseDto>> GetTicketByIdAsync(long id, string userEmail, Role userRole, long? tenantId);
    Task<ApiResponse<TicketResponseDto>> ReplyToTicketAsync(long ticketId, TicketReplyRequestDto dto, string userEmail);
    Task<ApiResponse<TicketResponseDto>> UpdateTicketStatusAsync(long ticketId, TicketStatus status, string userEmail, Role userRole);
    Task<ApiResponse<TicketDashboardResponseDto>> GetDashboardStatsAsync(string email);
}

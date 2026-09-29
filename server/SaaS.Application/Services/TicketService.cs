using System.IO;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IUserRepository _userRepository;

    public TicketService(ITicketRepository ticketRepository, IUserRepository userRepository)
    {
        _ticketRepository = ticketRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<TicketResponseDto>> CreateTicketAsync(CreateTicketRequestDto dto, string userEmail, Role userRole, long? tenantId)
    {
        string assignedToEmail = "";

        if (userRole == Role.Tenant)
        {
            // Tenant raising ticket to SuperAdmin
            var superAdmins = await _userRepository.GetUsersByRoleAsync(Role.SuperAdmin);
            var superAdmin = superAdmins.FirstOrDefault();
            if (superAdmin == null)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("No SuperAdmin found to assign the ticket to.", 404);
            }
            assignedToEmail = superAdmin.Email;
        }
        else if (userRole == Role.TenantAdmin)
        {
            if (!tenantId.HasValue)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("Tenant ID is required.", 400);
            }

            var tenants = await _userRepository.GetUsersByRoleAsync(Role.Tenant, tenantId.Value);
            var tenantUser = tenants.FirstOrDefault();
            if (tenantUser == null)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("No Tenant found to assign the ticket to.", 404);
            }
            assignedToEmail = tenantUser.Email;
        }
        else if (userRole > Role.TenantAdmin && userRole <= Role.Employee)
        {
            if (!tenantId.HasValue)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("Tenant ID is required for employee tickets.", 400);
            }

            var tenantAdmins = await _userRepository.GetUsersByRoleAsync(Role.TenantAdmin, tenantId.Value);
            var tenantAdmin = tenantAdmins.FirstOrDefault();
            if (tenantAdmin == null)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("No Tenant Admin found to assign the ticket to.", 404);
            }
            assignedToEmail = tenantAdmin.Email;
        }
        else
        {
            return ApiResponse<TicketResponseDto>.FailureResponse("SuperAdmins cannot create tickets.", 403);
        }

        var allowedSignatures = new List<byte[]>
        {
            new byte[] { 0xFF, 0xD8, 0xFF }, // JPEG
            new byte[] { 0x89, 0x50, 0x4E, 0x47 }, // PNG
            new byte[] { 0x25, 0x50, 0x44, 0x46 } // PDF
        };

        var uploadedFileNames = new List<string>();
        long maxSizeInBytes = 10 * 1024 * 1024; // 10MB limit
        string storagePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Tickets");
        if (!Directory.Exists(storagePath)) Directory.CreateDirectory(storagePath);

        if (dto.Attachments != null)
        {
            if (dto.Attachments.Count > 3)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("A maximum of 3 attachments are allowed.", 400);
            }

            foreach (var file in dto.Attachments)
            {
                if (file.Length > maxSizeInBytes)
                {
                    return ApiResponse<TicketResponseDto>.FailureResponse($"File {file.FileName} exceeds the maximum limit of 10MB.", 400);
                }

                bool isValidSignature = false;
                using (var readerStream = file.OpenReadStream())
                {
                    var headerBytes = new byte[4];
                    await readerStream.ReadAsync(headerBytes, 0, 4);

                    foreach (var signature in allowedSignatures)
                    {
                        bool match = true;
                        for (int i = 0; i < signature.Length; i++)
                        {
                            if (headerBytes[i] != signature[i])
                            {
                                match = false;
                                break;
                            }
                        }

                        if (match)
                        {
                            isValidSignature = true;
                            break;
                        }
                    }
                }

                if (!isValidSignature)
                {
                    return ApiResponse<TicketResponseDto>.FailureResponse($"Invalid file type for {file.FileName}. Only JPEG, PNG, and PDF are allowed.", 400);
                }

                string mappedFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string filePath = Path.Combine(storagePath, mappedFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                uploadedFileNames.Add(mappedFileName);
            }
        }

        var ticket = new Ticket
        {
            TenantId = tenantId,
            RaisedByEmail = userEmail,
            AssignedToEmail = assignedToEmail,
            Subject = dto.Subject,
            Description = dto.Description,
            Category = dto.Category,
            Priority = dto.Priority,
            ImageUrl = uploadedFileNames.Any() ? string.Join(",", uploadedFileNames) : null,
            Status = TicketStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        return ApiResponse<TicketResponseDto>.SuccessResponse(MapToDto(ticket), "Ticket created successfully.", 201);
    }

    public async Task<ApiResponse<List<TicketResponseDto>>> GetMyTicketsAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return ApiResponse<List<TicketResponseDto>>.FailureResponse("Email cannot be empty.", 400);
        }

        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return ApiResponse<List<TicketResponseDto>>.FailureResponse("User not found or invalid email.", 404);
        }

        var tickets = await _ticketRepository.GetByRaisedByEmailAsync(email);
        if (tickets == null || !tickets.Any())
        {
            return ApiResponse<List<TicketResponseDto>>.SuccessResponse(new List<TicketResponseDto>(), "No tickets found.", 200);
        }

        return ApiResponse<List<TicketResponseDto>>.SuccessResponse(tickets.Select(MapToDto).ToList(), "Tickets retrieved successfully.", 200);
    }

    public async Task<ApiResponse<List<TicketResponseDto>>> GetAssignedTicketsAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return ApiResponse<List<TicketResponseDto>>.FailureResponse("User not found or invalid email.", 404);
        }

        var tickets = await _ticketRepository.GetByAssignedToEmailAsync(email);
        if (tickets == null || !tickets.Any())
        {
            return ApiResponse<List<TicketResponseDto>>.SuccessResponse(new List<TicketResponseDto>(), "No assigned tickets found.", 200);
        }

        return ApiResponse<List<TicketResponseDto>>.SuccessResponse(tickets.Select(MapToDto).ToList(), "Assigned tickets retrieved successfully.", 200);
    }

    public async Task<ApiResponse<PagedResponseDto<TicketResponseDto>>> GetAssignedTicketsPagedAsync(string email, string? status, string? search, int pageNumber, int pageSize)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return ApiResponse<PagedResponseDto<TicketResponseDto>>.FailureResponse("User not found or invalid email.", 404);
        }

        var (tickets, totalCount) = await _ticketRepository.GetByAssignedToEmailPagedAsync(email, status, search, pageNumber, pageSize);

        var pagedData = new PagedResponseDto<TicketResponseDto>
        {
            Data = tickets.Select(MapToDto).ToList(),
            TotalRecords = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return ApiResponse<PagedResponseDto<TicketResponseDto>>.SuccessResponse(pagedData, "Assigned tickets retrieved successfully.", 200);
    }

    public async Task<ApiResponse<List<TicketResponseDto>>> GetTenantTicketsAsync(long tenantId)
    {
        var tickets = await _ticketRepository.GetByTenantIdAsync(tenantId);
        return ApiResponse<List<TicketResponseDto>>.SuccessResponse(tickets.Select(MapToDto).ToList(), "Tenant tickets retrieved successfully.", 200);
    }

    public async Task<ApiResponse<TicketDetailsResponseDto>> GetTicketByIdAsync(long id, string userEmail, Role userRole, long? tenantId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket == null) return ApiResponse<TicketDetailsResponseDto>.FailureResponse("Ticket not found.", 404);

        // Security check
        if (userRole == Role.SuperAdmin)
        {
            // Can view any
        }
        else if (userRole == Role.Tenant)
        {
            if (ticket.TenantId != tenantId && ticket.RaisedByEmail != userEmail)
                return ApiResponse<TicketDetailsResponseDto>.FailureResponse("Unauthorized to view this ticket.", 403);
        }
        else
        {
            if (ticket.RaisedByEmail != userEmail && ticket.AssignedToEmail != userEmail)
                return ApiResponse<TicketDetailsResponseDto>.FailureResponse("Unauthorized to view this ticket.", 403);
        }

        return ApiResponse<TicketDetailsResponseDto>.SuccessResponse(MapToDetailsDto(ticket), "Ticket retrieved successfully.", 200);
    }

    public async Task<ApiResponse<TicketResponseDto>> ReplyToTicketAsync(long ticketId, TicketReplyRequestDto dto, string userEmail)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null) return ApiResponse<TicketResponseDto>.FailureResponse("Ticket not found.", 404);

        if (ticket.RaisedByEmail != userEmail && ticket.AssignedToEmail != userEmail)
        {
            // Allow SuperAdmin to reply to any ticket assigned to a SuperAdmin.
            // Simplified check: if not raised by or assigned to, and the user is not the one assigned, block.
            // A more complex check could verify if userEmail belongs to SuperAdmins.
            var user = await _userRepository.GetByEmailAsync(userEmail);
            if (user == null || (user.Role != Role.SuperAdmin && ticket.RaisedByEmail != userEmail && ticket.AssignedToEmail != userEmail))
            {
                 return ApiResponse<TicketResponseDto>.FailureResponse("Unauthorized to reply to this ticket.", 403);
            }
        }

        var reply = new TicketReply
        {
            TicketId = ticketId,
            ReplyByEmail = userEmail,
            Message = dto.Message,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddReplyAsync(reply);
        
        ticket.UpdatedAt = DateTime.UtcNow;
        await _ticketRepository.UpdateAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        var updatedTicket = await _ticketRepository.GetByIdAsync(ticketId);
        return ApiResponse<TicketResponseDto>.SuccessResponse(MapToDto(updatedTicket!), "Reply added successfully.", 200);
    }

    public async Task<ApiResponse<TicketResponseDto>> UpdateTicketStatusAsync(long ticketId, TicketStatus status, string userEmail, Role userRole)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null) return ApiResponse<TicketResponseDto>.FailureResponse("Ticket not found.", 404);

        bool isSuperAdmin = userRole == Role.SuperAdmin;
        bool isAssigned = ticket.AssignedToEmail == userEmail;
        bool isCreator = ticket.RaisedByEmail == userEmail;

        if (!isSuperAdmin && !isAssigned && !isCreator)
        {
            return ApiResponse<TicketResponseDto>.FailureResponse("Only the assigned user, creator, or SuperAdmin can change the status.", 403);
        }

        if (isCreator && !isSuperAdmin && !isAssigned)
        {
            if (status == TicketStatus.Escalated || status == TicketStatus.Solved)
            {
                return ApiResponse<TicketResponseDto>.FailureResponse("Ticket creator can only open or close the ticket.", 403);
            }
        }

        if (isSuperAdmin && status == TicketStatus.Escalated)
        {
            return ApiResponse<TicketResponseDto>.FailureResponse("SuperAdmins cannot escalate a ticket.", 403);
        }

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;
        
        if (status == TicketStatus.Escalated && userRole == Role.Tenant)
        {
            // Escalate to SuperAdmin
            var superAdmins = await _userRepository.GetUsersByRoleAsync(Role.SuperAdmin);
            var superAdmin = superAdmins.FirstOrDefault();
            if (superAdmin != null)
            {
                ticket.AssignedToEmail = superAdmin.Email;
            }
        }

        await _ticketRepository.UpdateAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        return ApiResponse<TicketResponseDto>.SuccessResponse(MapToDto(ticket), $"Ticket status updated to {status}.", 200);
    }
    
    private static TicketResponseDto MapToDto(Ticket ticket)
    {
        return new TicketResponseDto
        {
            Id = ticket.Id,
            TenantId = ticket.TenantId,
            RaisedByEmail = ticket.RaisedByEmail,
            AssignedToEmail = ticket.AssignedToEmail,
            Subject = ticket.Subject,
            Description = ticket.Description,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            ImageUrl = ticket.ImageUrl,
            AttachmentsCount = string.IsNullOrEmpty(ticket.ImageUrl) ? 0 : ticket.ImageUrl.Split(',').Length,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    private static TicketDetailsResponseDto MapToDetailsDto(Ticket ticket)
    {
        return new TicketDetailsResponseDto
        {
            Id = ticket.Id,
            TenantId = ticket.TenantId,
            RaisedByEmail = ticket.RaisedByEmail,
            AssignedToEmail = ticket.AssignedToEmail,
            Subject = ticket.Subject,
            Description = ticket.Description,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            ImageUrl = ticket.ImageUrl,
            AttachmentsCount = string.IsNullOrEmpty(ticket.ImageUrl) ? 0 : ticket.ImageUrl.Split(',').Length,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            Replies = ticket.Replies.Select(r => new TicketReplyResponseDto
            {
                Id = r.Id,
                ReplyByEmail = r.ReplyByEmail,
                Message = r.Message,
                ImageUrl = r.ImageUrl,
                CreatedAt = r.CreatedAt
            }).OrderBy(r => r.CreatedAt).ToList()
        };
    }
    public async Task<ApiResponse<TicketDashboardResponseDto>> GetDashboardStatsAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return ApiResponse<TicketDashboardResponseDto>.FailureResponse("Email is required.", 400);
        }

        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            return ApiResponse<TicketDashboardResponseDto>.FailureResponse("User not found.", 404);
        }

        var stats = await _ticketRepository.GetDashboardStatsAsync(email);
        return ApiResponse<TicketDashboardResponseDto>.SuccessResponse(stats, "Dashboard stats retrieved successfully.", 200);
    }
}

using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class TenantAdminService : ITenantAdminService
{
    private readonly IUserRepository _userRepository;

    public TenantAdminService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<IEnumerable<TenantAdminResponseDto>>> GetTenantAdminsAsync(long tenantId)
    {
        var admins = await _userRepository.GetTenantAdminsAsync(tenantId);

        var adminDtos = admins.Select(a => new TenantAdminResponseDto
        {
            Id = a.Id,
            FirstName = a.FirstName,
            LastName = a.LastName,
            Email = a.Email,
            Phone = a.PhoneNumber ?? string.Empty,
            Status = a.Status,
            CreatedAt = a.CreatedAt
        });

        return new ApiResponse<IEnumerable<TenantAdminResponseDto>>
        {
            Success = true,
            Message = "Tenant admins retrieved successfully.",
            Data = adminDtos,
            StatusCode = 200
        };
    }

    public async Task<ApiResponse<string>> UpdateTenantAdminAsync(long tenantId, long adminId, UpdateTenantAdminRequestDto request)
    {
        var user = await _userRepository.GetByIdAsync(adminId);
        
        if (user == null || user.TenantId != tenantId || user.Role != Role.TenantAdmin)
        {
            return new ApiResponse<string> { Success = false, Message = "Tenant admin not found.", StatusCode = 404 };
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.Phone;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return new ApiResponse<string> { Success = true, Message = "Tenant admin updated successfully.", StatusCode = 200 };
    }

    public async Task<ApiResponse<string>> UpdateTenantAdminStatusAsync(long tenantId, long adminId, UpdateTenantAdminStatusRequestDto request)
    {
        var user = await _userRepository.GetByIdAsync(adminId);
        
        if (user == null || user.TenantId != tenantId || user.Role != Role.TenantAdmin)
        {
            return new ApiResponse<string> { Success = false, Message = "Tenant admin not found.", StatusCode = 404 };
        }

        user.Status = request.Status;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return new ApiResponse<string> { Success = true, Message = "Tenant admin status updated successfully.", StatusCode = 200 };
    }

    public async Task<ApiResponse<string>> SoftDeleteTenantAdminAsync(long tenantId, long adminId)
    {
        var user = await _userRepository.GetByIdAsync(adminId);
        
        if (user == null || user.TenantId != tenantId || user.Role != Role.TenantAdmin)
        {
            return new ApiResponse<string> { Success = false, Message = "Tenant admin not found.", StatusCode = 404 };
        }

        user.Status = UserStatus.Deleted;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return new ApiResponse<string> { Success = true, Message = "Tenant admin deleted successfully.", StatusCode = 200 };
    }
}

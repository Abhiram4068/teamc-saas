using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Requests;

public class UpdateTenantAdminStatusRequestDto
{
    public UserStatus Status { get; set; }
}

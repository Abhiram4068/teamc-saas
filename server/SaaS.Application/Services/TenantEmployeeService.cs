using Microsoft.Extensions.Logging;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.DTOs.Common;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;


namespace SaaS.Application.Services;

public class TenantEmployeeService : ITenantEmployeeService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDesignationRepository _designationRepository;
    private readonly ILogger<TenantEmployeeService> _logger;

    public TenantEmployeeService(
        IUserRepository userRepository,
        IEmployeeRepository employeeRepository,
        IDesignationRepository designationRepository,
        ILogger<TenantEmployeeService> logger)
    {
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
        _designationRepository = designationRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<string>> CreateEmployeeAsync(int tenantId, CreateEmployeeRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLower();

        // Check if email is already taken
        if (await _userRepository.GetByEmailAsync(normalizedEmail) != null)
        {
            return ApiResponse<string>.FailureResponse("User with this email already exists.", 400);
        }

        // Verify Designation belongs to the given Department
        var designation = await _designationRepository.GetByIdAsync(request.DesignationId);
        if (designation == null || designation.DepartmentId != request.DepartmentId)
        {
            return ApiResponse<string>.FailureResponse("Invalid Designation for the selected Department.", 400);
        }

        try
        {
            // 1. Create User
            var user = new User
            {
                TenantId = tenantId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = normalizedEmail,
                PhoneNumber = request.PhoneNumber,
                Role = request.Role, // Admin can specify if it's Employee, HR, etc.
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                // Hardcoding basic hashing for now, ideally use BCrypt
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync(); // Saves the user so we get the ID

            // 2. Create Employee Profile
            var employee = new Employee
            {
                UserId = user.Id,
                TenantId = tenantId,
                DepartmentId = request.DepartmentId,
                DesignationId = request.DesignationId,
                JoiningDate = request.JoiningDate,
                CreatedAt = DateTime.UtcNow
            };

            await _employeeRepository.AddAsync(employee);
            await _userRepository.SaveChangesAsync(); // Saves the employee record

            return ApiResponse<string>.SuccessResponse(string.Empty, "Employee created successfully.", 201);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee.");
            return ApiResponse<string>.FailureResponse("An error occurred while creating the employee.", 500);
        }
    }

    public async Task<ApiResponse<PagedResponseDto<EmployeeResponseDto>>> GetEmployeesAsync(int tenantId, long userId, Role role, GetEmployeesRequestDto request)
    {
        try
        {
            // Visibility rules
            if (role == Role.Hr || role == Role.TenantAdmin)
            {
                // HR and TenantAdmin can see all employees. Do not filter by ReportingManagerId.
                request.ReportingManagerId = null;
            }
            else if (role == Role.Manager)
            {
                // Manager can only see employees reporting to them.
                var employee = await _employeeRepository.GetByUserIdAsync(userId);
                if (employee == null)
                {
                    return ApiResponse<PagedResponseDto<EmployeeResponseDto>>.FailureResponse("Employee record not found for manager.", 403);
                }
                request.ReportingManagerId = employee.Id;
            }
            else
            {
                // Other roles (e.g. Employee) cannot view the employee list this way.
                return ApiResponse<PagedResponseDto<EmployeeResponseDto>>.FailureResponse("Unauthorized access.", 403);
            }

            var (items, totalCount) = await _employeeRepository.GetEmployeesAsync(tenantId, request);

            var mappedItems = items.Select(e => new EmployeeResponseDto
            {
                Id = e.Id,
                UserId = e.UserId,
                FirstName = e.User.FirstName,
                LastName = e.User.LastName,
                Email = e.User.Email,
                PhoneNumber = e.User.PhoneNumber,
                DepartmentId = e.DepartmentId,
                DepartmentName = e.Department?.Name,
                DesignationId = e.DesignationId,
                DesignationName = e.Designation?.Name,
                Role = e.User.Role,
                JoiningDate = e.JoiningDate,
                ReportingManagerId = e.ReportingManagerId
            }).ToList();

            var pagedResponse = new PagedResponseDto<EmployeeResponseDto>
            {
                Data = mappedItems,
                TotalRecords = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };

            return ApiResponse<PagedResponseDto<EmployeeResponseDto>>.SuccessResponse(pagedResponse, "Employees retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving employees for Tenant: {TenantId}", tenantId);
            return ApiResponse<PagedResponseDto<EmployeeResponseDto>>.FailureResponse("An error occurred while processing the request.");
        }
    }

    public async Task<ApiResponse<EmployeeDashboardSummaryDto>> GetDashboardSummaryAsync(int tenantId, long userId, Role role)
    {
        try
        {
            var summary = new EmployeeDashboardSummaryDto();

            switch (role)
            {
                case Role.Hr:
                case Role.TenantAdmin:
                    summary.TotalEmployees = await _employeeRepository.GetTotalCountAsync(tenantId);
                    summary.TotalManagers = await _employeeRepository.GetManagerCountAsync(tenantId);
                    break;
                    
                case Role.Manager:
                    var emp = await _employeeRepository.GetByUserIdAsync(userId);
                    if (emp != null)
                    {
                        summary.ReportingEmployees = await _employeeRepository.GetDirectReportsCountAsync(emp.Id);
                    }
                    break;
                    
                case Role.Employee:
                    // Currently hardcoded as per requirement, or could be fetched from Leaves repository if implemented later
                    summary.TotalLeaves = 12;
                    break;
            }

            return ApiResponse<EmployeeDashboardSummaryDto>.SuccessResponse(summary, "Dashboard summary retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving dashboard summary for Tenant: {TenantId}", tenantId);
            return ApiResponse<EmployeeDashboardSummaryDto>.FailureResponse("An error occurred while processing the request.");
        }
    }

    public async Task<ApiResponse<EmployeeDetailedResponseDto>> GetEmployeeByIdAsync(int tenantId, long employeeId, long currentUserId, Role role)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            
            if (employee == null || employee.TenantId != tenantId || employee.User.Status == UserStatus.Deleted)
            {
                return ApiResponse<EmployeeDetailedResponseDto>.FailureResponse("Employee not found.", 404);
            }

            // Authorization check
            if (role == Role.Manager)
            {
                var currentEmployee = await _employeeRepository.GetByUserIdAsync(currentUserId);
                if (currentEmployee == null || employee.ReportingManagerId != currentEmployee.Id)
                {
                    return ApiResponse<EmployeeDetailedResponseDto>.FailureResponse("Unauthorized access.", 403);
                }
            }

            var dto = new EmployeeDetailedResponseDto
            {
                Id = employee.Id,
                UserId = employee.UserId,
                FirstName = employee.User.FirstName,
                LastName = employee.User.LastName,
                Email = employee.User.Email,
                PhoneNumber = employee.User.PhoneNumber,
                DepartmentId = employee.DepartmentId,
                DepartmentName = employee.Department?.Name,
                DesignationId = employee.DesignationId,
                DesignationName = employee.Designation?.Name,
                Role = employee.User.Role,
                Status = employee.User.Status.ToString(),
                DateOfJoining = employee.JoiningDate,
                CreatedAt = employee.User.CreatedAt,
                UpdatedAt = employee.User.UpdatedAt,
                EmployeeCode = null, // Or implement if EmployeeCode exists on Employee entity
                ReportingManagerId = employee.ReportingManagerId,
                ManagerName = employee.ReportingManager != null ? $"{employee.ReportingManager.User.FirstName} {employee.ReportingManager.User.LastName}" : null
            };

            return ApiResponse<EmployeeDetailedResponseDto>.SuccessResponse(dto, "Employee details retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee {EmployeeId}", employeeId);
            return ApiResponse<EmployeeDetailedResponseDto>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> UpdateEmployeeProfileAsync(int tenantId, long employeeId, UpdateEmployeeProfileRequestDto request)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null || employee.TenantId != tenantId)
                return ApiResponse<string>.FailureResponse("Employee not found.", 404);

            if (request.FirstName != null) employee.User.FirstName = request.FirstName;
            if (request.LastName != null) employee.User.LastName = request.LastName;
            if (request.PhoneNumber != null) employee.User.PhoneNumber = request.PhoneNumber;

            employee.User.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(string.Empty, "Employee profile updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee profile {EmployeeId}", employeeId);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> UpdateUserStatusAsync(int tenantId, long employeeId, UpdateUserStatusRequestDto request)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null || employee.TenantId != tenantId)
                return ApiResponse<string>.FailureResponse("Employee not found.", 404);

            employee.User.Status = request.IsActive ? UserStatus.Active : UserStatus.Inactive;
            employee.User.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(string.Empty, $"User status changed to {(request.IsActive ? "Active" : "Inactive")}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status {EmployeeId}", employeeId);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }


    public async Task<ApiResponse<string>> DeleteEmployeeAsync(int tenantId, long employeeId, DeleteUserRequestDto request)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null || employee.TenantId != tenantId)
                return ApiResponse<string>.FailureResponse("Employee not found.", 404);

            employee.User.Status = UserStatus.Deleted;
            employee.User.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(string.Empty, "User deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee {EmployeeId}", employeeId);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> UpdateReportingManagerAsync(int tenantId, long employeeId, UpdateReportingManagerRequestDto request)
    {
        try
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null || employee.TenantId != tenantId)
                return ApiResponse<string>.FailureResponse("Employee not found.", 404);

            if (request.ManagerId == employee.Id)
                return ApiResponse<string>.FailureResponse("Employee cannot be their own manager.", 400);

            var manager = await _employeeRepository.GetByIdAsync(request.ManagerId);
            if (manager == null || manager.TenantId != tenantId || manager.User.Status != UserStatus.Active)
                return ApiResponse<string>.FailureResponse("Selected manager is invalid or inactive.", 400);

            employee.ReportingManagerId = request.ManagerId;
            employee.User.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(string.Empty, "Reporting manager updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating reporting manager {EmployeeId}", employeeId);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<IEnumerable<EmployeeResponseDto>>> GetManagersAsync(int tenantId, string? search)
    {
        try
        {
            var req = new GetEmployeesRequestDto { PageSize = 100, PageNumber = 1, SearchTerm = search, SortBy = "name" };
            var (items, _) = await _employeeRepository.GetEmployeesAsync(tenantId, req);
            
            var managers = items.Where(e => e.User.Role == Role.Manager && e.User.Status == UserStatus.Active).Select(e => new EmployeeResponseDto
            {
                Id = e.Id,
                UserId = e.UserId,
                FirstName = e.User.FirstName,
                LastName = e.User.LastName,
                Email = e.User.Email,
                DepartmentId = e.DepartmentId,
                DesignationId = e.DesignationId
            }).ToList();
            
            return ApiResponse<IEnumerable<EmployeeResponseDto>>.SuccessResponse(managers, "Managers retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving managers for Tenant: {TenantId}", tenantId);
            return ApiResponse<IEnumerable<EmployeeResponseDto>>.FailureResponse("An error occurred.", 500);
        }
    }
}

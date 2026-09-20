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

    public async Task<ApiResponse<PagedResponseDto<EmployeeResponseDto>>> GetEmployeesAsync(int tenantId, GetEmployeesRequestDto request)
    {
        try
        {
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

            return ApiResponse<PagedResponseDto<EmployeeResponseDto>>.SuccessResponse(pagedResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employees for TenantId: {TenantId}", tenantId);
            return ApiResponse<PagedResponseDto<EmployeeResponseDto>>.FailureResponse("An error occurred while fetching employees.", 500);
        }
    }
}

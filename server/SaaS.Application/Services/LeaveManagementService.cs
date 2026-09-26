using Microsoft.Extensions.Logging;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Application.Services;

public class LeaveManagementService : ILeaveManagementService
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILogger<LeaveManagementService> _logger;

    public LeaveManagementService(
        ILeaveRepository leaveRepository,
        IEmployeeRepository employeeRepository,
        ILogger<LeaveManagementService> logger)
    {
        _leaveRepository = leaveRepository;
        _employeeRepository = employeeRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>>> GetLeaveBalancesAsync(long tenantId, LeaveBalanceQueryRequestDto query)
    {
        try
        {
            var leaveTypes = await _leaveRepository.GetLeaveTypesAsync(tenantId);
            var (users, balances, totalCount) = await _leaveRepository.GetEmployeesWithLeaveBalancesAsync(tenantId, query);
            
            var items = users.Select(u => new EmployeeLeaveBalancesResponseDto
            {
                EmployeeId = u.Id,
                EmployeeName = $"{u.FirstName} {u.LastName}".Trim(),
                Email = u.Email,
                Designation = u.Employee?.Designation?.Name,
                Balances = leaveTypes.Select(lt => 
                {
                    var balance = balances.FirstOrDefault(b => b.EmployeeId == u.Id && b.LeaveTypeId == lt.Id);
                    return new LeaveBalanceItemDto
                    {
                        Id = balance?.Id ?? 0,
                        LeaveTypeId = lt.Id,
                        LeaveType = lt.Name,
                        TotalLeaves = balance?.TotalDays ?? 0,
                        UsedLeaves = balance?.UsedDays ?? 0,
                        RemainingLeaves = (balance?.TotalDays ?? 0) - (balance?.UsedDays ?? 0),
                        Year = balance?.Year ?? DateTime.UtcNow.Year
                    };
                }).ToList()
            }).ToList();

            var response = new PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>>.SuccessResponse(response, "Leave balances retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leave balances for Tenant {TenantId}", tenantId);
            return ApiResponse<PaginatedResponseDto<EmployeeLeaveBalancesResponseDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<EmployeeLeaveBalancesResponseDto>> GetMyLeaveBalancesAsync(long tenantId, long userId)
    {
        try
        {
            var user = await _employeeRepository.GetByUserIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<EmployeeLeaveBalancesResponseDto>.FailureResponse("Employee not found.", 404);
            }

            var leaveTypes = await _leaveRepository.GetLeaveTypesAsync(tenantId);
            var balances = await _leaveRepository.GetLeaveBalancesByEmployeeIdAsync(tenantId, userId);
            
            var response = new EmployeeLeaveBalancesResponseDto
            {
                EmployeeId = user.UserId,
                EmployeeName = $"{user.User.FirstName} {user.User.LastName}".Trim(),
                Email = user.User.Email,
                Designation = user.Designation?.Name,
                Balances = leaveTypes.Select(lt => 
                {
                    var balance = balances.FirstOrDefault(b => b.EmployeeId == user.UserId && b.LeaveTypeId == lt.Id);
                    return new LeaveBalanceItemDto
                    {
                        Id = balance?.Id ?? 0,
                        LeaveTypeId = lt.Id,
                        LeaveType = lt.Name,
                        TotalLeaves = balance?.TotalDays ?? 0,
                        UsedLeaves = balance?.UsedDays ?? 0,
                        RemainingLeaves = (balance?.TotalDays ?? 0) - (balance?.UsedDays ?? 0),
                        Year = balance?.Year ?? DateTime.UtcNow.Year
                    };
                }).ToList()
            };

            return ApiResponse<EmployeeLeaveBalancesResponseDto>.SuccessResponse(response, "My leave balances retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leave balances for User {UserId}", userId);
            return ApiResponse<EmployeeLeaveBalancesResponseDto>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>> GetMyLeaveRequestsAsync(long tenantId, long userId, LeaveRequestQueryDto query)
    {
        try
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null)
            {
                return ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>.FailureResponse("Employee not found.", 404);
            }

            var (requests, totalCount) = await _leaveRepository.GetLeaveRequestsByEmployeeIdAsync(tenantId, employee.UserId, query.PageNumber, query.PageSize);

            var items = requests.Select(r => new LeaveRequestResponseDto
            {
                Id = r.Id,
                LeaveType = r.LeaveType.Name,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                NumberOfDays = r.NumberOfDays,
                Status = r.Status,
                Reason = r.Reason,
                ManagerComment = r.ManagerComment,
                CreatedAt = r.CreatedAt
            }).ToList();

            var response = new PaginatedResponseDto<LeaveRequestResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>.SuccessResponse(response, "Leave requests retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leave requests for User {UserId}", userId);
            return ApiResponse<PaginatedResponseDto<LeaveRequestResponseDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> CancelLeaveRequestAsync(long tenantId, long userId, int requestId)
    {
        try
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null)
            {
                return ApiResponse<string>.FailureResponse("Employee not found.", 404);
            }

            var request = await _leaveRepository.GetLeaveRequestByIdAsync(tenantId, requestId);
            if (request == null || request.EmployeeId != employee.UserId)
            {
                return ApiResponse<string>.FailureResponse("Leave request not found.", 404);
            }

            if (request.Status != LeaveStatus.Pending && request.Status != LeaveStatus.Approved)
            {
                return ApiResponse<string>.FailureResponse($"Cannot cancel a leave request with status {request.Status}.", 400);
            }

            // Refund balance
            var balance = await _leaveRepository.GetLeaveBalanceAsync(tenantId, employee.UserId, request.LeaveTypeId, request.StartDate.Year);
            if (balance != null)
            {
                balance.UsedDays -= request.NumberOfDays;
                await _leaveRepository.UpdateLeaveBalanceAsync(balance);
            }

            request.Status = SaaS.Domain.Enums.LeaveStatus.Cancelled;
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse("Leave request cancelled successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling leave request {RequestId} for User {UserId}", requestId, userId);
            return ApiResponse<string>.FailureResponse("An error occurred while cancelling leave request.", 500);
        }
    }

    public async Task<ApiResponse<PaginatedResponseDto<TeamLeaveRequestResponseDto>>> GetTeamLeaveRequestsAsync(long tenantId, long managerUserId, LeaveRequestQueryDto query)
    {
        try
        {
            var (requests, totalCount) = await _leaveRepository.GetTeamLeaveRequestsAsync(tenantId, managerUserId, query.PageNumber, query.PageSize);

            var items = requests.Select(r => new TeamLeaveRequestResponseDto
            {
                Id = r.Id,
                EmployeeName = r.Employee.FirstName + " " + r.Employee.LastName,
                LeaveType = r.LeaveType.Name,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                NumberOfDays = r.NumberOfDays,
                Status = r.Status,
                Reason = r.Reason,
                ManagerComment = r.ManagerComment,
                CreatedAt = r.CreatedAt
            }).ToList();

            var response = new PaginatedResponseDto<TeamLeaveRequestResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            return ApiResponse<PaginatedResponseDto<TeamLeaveRequestResponseDto>>.SuccessResponse(response, "Team leave requests retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting team leave requests for Manager {ManagerUserId}", managerUserId);
            return ApiResponse<PaginatedResponseDto<TeamLeaveRequestResponseDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> ApproveLeaveRequestAsync(long tenantId, long managerUserId, int requestId, string? comment)
    {
        try
        {
            var request = await _leaveRepository.GetLeaveRequestByIdAsync(tenantId, requestId);
            if (request == null || request.ManagerId != managerUserId)
            {
                return ApiResponse<string>.FailureResponse("Leave request not found.", 404);
            }

            if (request.Status != LeaveStatus.Pending)
            {
                return ApiResponse<string>.FailureResponse($"Cannot approve a leave request with status {request.Status}.", 400);
            }

            request.Status = LeaveStatus.Approved;
            request.UpdatedAt = DateTime.UtcNow;
            request.ManagerComment = comment;
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse("Leave request approved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving leave request {RequestId}", requestId);
            return ApiResponse<string>.FailureResponse("An error occurred while approving leave request.", 500);
        }
    }

    public async Task<ApiResponse<string>> RejectLeaveRequestAsync(long tenantId, long managerUserId, int requestId, string? comment)
    {
        try
        {
            var request = await _leaveRepository.GetLeaveRequestByIdAsync(tenantId, requestId);
            if (request == null || request.ManagerId != managerUserId)
            {
                return ApiResponse<string>.FailureResponse("Leave request not found.", 404);
            }

            if (request.Status != SaaS.Domain.Enums.LeaveStatus.Pending)
            {
                return ApiResponse<string>.FailureResponse($"Cannot reject a leave request with status {request.Status}.", 400);
            }

            // Refund balance
            var balance = await _leaveRepository.GetLeaveBalanceAsync(tenantId, request.EmployeeId, request.LeaveTypeId, request.StartDate.Year);
            if (balance != null)
            {
                balance.UsedDays -= request.NumberOfDays;
                await _leaveRepository.UpdateLeaveBalanceAsync(balance);
            }

            request.Status = SaaS.Domain.Enums.LeaveStatus.Rejected;
            request.ManagerComment = comment;
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse("Leave request rejected successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting leave request {RequestId}", requestId);
            return ApiResponse<string>.FailureResponse("An error occurred while rejecting leave request.", 500);
        }
    }

    private decimal CalculateBusinessDays(DateOnly startDate, DateOnly endDate)
    {
        if (endDate < startDate) return 0;
        
        decimal count = 0;
        var currentDate = startDate;
        
        while (currentDate <= endDate)
        {
            if (currentDate.DayOfWeek != DayOfWeek.Saturday && currentDate.DayOfWeek != DayOfWeek.Sunday)
            {
                count++;
            }
            currentDate = currentDate.AddDays(1);
        }
        
        return count;
    }

    public async Task<ApiResponse<string>> SubmitLeaveRequestAsync(long tenantId, long userId, SubmitLeaveRequestDto request)
    {
        try
        {
            if (request.EndDate < request.StartDate)
            {
                return ApiResponse<string>.FailureResponse("End date cannot be earlier than start date.", 400);
            }

            var employee = await _employeeRepository.GetByUserIdAsync(userId);
            if (employee == null || employee.User.Status != SaaS.Domain.Enums.UserStatus.Active)
            {
                return ApiResponse<string>.FailureResponse("Active employee record not found.", 404);
            }

            if (!employee.ReportingManagerId.HasValue)
            {
                return ApiResponse<string>.FailureResponse("You do not have a reporting manager assigned. Please contact HR.", 400);
            }

            // Need to get the Manager's UserId (since ReportingManagerId points to Employee.Id)
            var managerEmployee = await _employeeRepository.GetByIdAsync(employee.ReportingManagerId.Value);
            if (managerEmployee == null)
            {
                return ApiResponse<string>.FailureResponse("Your assigned reporting manager could not be found.", 404);
            }

            var leaveType = await _leaveRepository.GetLeaveTypeByIdAsync(tenantId, request.LeaveTypeId);
            if (leaveType == null || !leaveType.IsActive)
            {
                return ApiResponse<string>.FailureResponse("Invalid or inactive leave type selected.", 400);
            }

            var totalDaysRequested = CalculateBusinessDays(request.StartDate, request.EndDate);
            if (totalDaysRequested <= 0)
            {
                return ApiResponse<string>.FailureResponse("The selected date range does not contain any business days.", 400);
            }

            var currentYear = request.StartDate.Year;
            var balance = await _leaveRepository.GetLeaveBalanceAsync(tenantId, employee.UserId, request.LeaveTypeId, currentYear);
            
            if (balance == null)
            {
                return ApiResponse<string>.FailureResponse("You do not have a leave balance allocated for this leave type.", 400);
            }

            var remainingLeaves = balance.TotalDays - balance.UsedDays;
            if (totalDaysRequested > remainingLeaves)
            {
                return ApiResponse<string>.FailureResponse($"Insufficient balance. You requested {totalDaysRequested} days, but only have {remainingLeaves} days available.", 400);
            }

            // Update balance
            balance.UsedDays += totalDaysRequested;
            await _leaveRepository.UpdateLeaveBalanceAsync(balance);

            // Create Request
            var leaveRequest = new SaaS.Domain.Entities.LeaveRequest
            {
                TenantId = tenantId,
                EmployeeId = employee.UserId,
                ManagerId = managerEmployee.UserId,
                LeaveTypeId = request.LeaveTypeId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                NumberOfDays = totalDaysRequested,
                Reason = request.Reason,
                Status = SaaS.Domain.Enums.LeaveStatus.Pending
            };

            await _leaveRepository.AddLeaveRequestAsync(leaveRequest);
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse("Leave request submitted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting leave request for User {UserId}", userId);
            return ApiResponse<string>.FailureResponse("An error occurred while submitting leave request.", 500);
        }
    }

    public async Task<ApiResponse<string>> AllocateLeaveAsync(long tenantId, AllocateLeaveRequestDto request)
    {
        try
        {
            // 1 & 2. Verify Employee exists and belongs to this tenant
            var employee = await _employeeRepository.GetByUserIdAsync(request.EmployeeId);
            if (employee == null || employee.TenantId != tenantId || employee.User.Status == UserStatus.Deleted)
            {
                return ApiResponse<string>.FailureResponse("Invalid employee or employee does not belong to this tenant.", 400);
            }

            // 3. Verify Leave Type belongs to this tenant
            var leaveType = await _leaveRepository.GetLeaveTypeByIdAsync(tenantId, request.LeaveTypeId);
            if (leaveType == null)
            {
                return ApiResponse<string>.FailureResponse("Invalid leave type or leave type does not belong to this tenant.", 400);
            }

            // 4. Check existing balance
            var existingBalance = await _leaveRepository.GetLeaveBalanceAsync(tenantId, request.EmployeeId, request.LeaveTypeId, request.Year);
            if (existingBalance != null)
            {
                // Upsert behavior: update total days
                existingBalance.TotalDays = request.TotalDays;
                await _leaveRepository.UpdateLeaveBalanceAsync(existingBalance);
            }
            else
            {
                // Insert new balance
                var newBalance = new EmployeeLeaveBalance
                {
                    TenantId = tenantId,
                    EmployeeId = request.EmployeeId,
                    LeaveTypeId = request.LeaveTypeId,
                    Year = request.Year,
                    TotalDays = request.TotalDays,
                    UsedDays = 0 // Starts at 0
                };
                await _leaveRepository.AddLeaveBalanceAsync(newBalance);
            }

            await _leaveRepository.SaveChangesAsync();
            return ApiResponse<string>.SuccessResponse(string.Empty, "Leave allocated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error allocating leave for Employee {EmployeeId}", request.EmployeeId);
            return ApiResponse<string>.FailureResponse("An error occurred while allocating leave.", 500);
        }
    }

    public async Task<ApiResponse<string>> UpdateLeaveBalanceAsync(long tenantId, int balanceId, UpdateLeaveBalanceRequestDto request)
    {
        try
        {
            var balance = await _leaveRepository.GetLeaveBalanceByIdAsync(tenantId, balanceId);
            if (balance == null)
            {
                return ApiResponse<string>.FailureResponse("Leave balance not found.", 404);
            }

            balance.TotalDays += request.AdditionalLeaves;

            if (balance.TotalDays < balance.UsedDays)
            {
                return ApiResponse<string>.FailureResponse($"Cannot reduce total days below used days ({balance.UsedDays}).", 400);
            }

            await _leaveRepository.UpdateLeaveBalanceAsync(balance);
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(string.Empty, "Leave balance updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating leave balance {BalanceId}", balanceId);
            return ApiResponse<string>.FailureResponse("An error occurred while updating leave balance.", 500);
        }
    }

    public async Task<ApiResponse<IEnumerable<LeaveTypeResponseDto>>> GetLeaveTypesAsync(long tenantId)
    {
        try
        {
            var types = await _leaveRepository.GetLeaveTypesAsync(tenantId);
            var response = types.Select(t => new LeaveTypeResponseDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                IsActive = t.IsActive
            });
            return ApiResponse<IEnumerable<LeaveTypeResponseDto>>.SuccessResponse(response, "Leave types retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting leave types for Tenant {TenantId}", tenantId);
            return ApiResponse<IEnumerable<LeaveTypeResponseDto>>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> CreateLeaveTypeAsync(long tenantId, CreateLeaveTypeRequestDto request)
    {
        try
        {
            var leaveType = new LeaveType
            {
                TenantId = tenantId,
                Name = request.Name,
                Code = "NA", // Default code as requested
                Description = request.Description,
                IsActive = true 
            };

            await _leaveRepository.AddLeaveTypeAsync(leaveType);
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(string.Empty, "Leave type created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating leave type for Tenant {TenantId}", tenantId);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> UpdateLeaveTypeAsync(long tenantId, int id, UpdateLeaveTypeRequestDto request)
    {
        try
        {
            var leaveType = await _leaveRepository.GetLeaveTypeByIdAsync(tenantId, id);
            if (leaveType == null)
            {
                return ApiResponse<string>.FailureResponse("Leave type not found.", 404);
            }

            leaveType.Name = request.Name;
            leaveType.Description = request.Description;
            leaveType.IsActive = request.IsActive;

            await _leaveRepository.UpdateLeaveTypeAsync(leaveType);
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(string.Empty, "Leave type updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating leave type {Id}", id);
            return ApiResponse<string>.FailureResponse("An error occurred.", 500);
        }
    }

    public async Task<ApiResponse<string>> DeleteLeaveTypeAsync(long tenantId, int id)
    {
        try
        {
            var leaveType = await _leaveRepository.GetLeaveTypeByIdAsync(tenantId, id);
            if (leaveType == null)
            {
                return ApiResponse<string>.FailureResponse("Leave type not found.", 404);
            }

            await _leaveRepository.DeleteLeaveTypeAsync(leaveType);
            await _leaveRepository.SaveChangesAsync();

            return ApiResponse<string>.SuccessResponse(string.Empty, "Leave type deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting leave type {Id}", id);
            return ApiResponse<string>.FailureResponse("An error occurred. It may be in use.", 500);
        }
    }
}

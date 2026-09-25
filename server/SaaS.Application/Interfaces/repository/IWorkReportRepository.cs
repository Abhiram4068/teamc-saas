using SaaS.Domain.Entities;

namespace SaaS.Application.Interfaces.Repository;

public interface IWorkReportRepository
{
    // Work Reports
    Task<WorkReport?> GetByIdAsync(long id, long tenantId);
    Task<(IEnumerable<WorkReport> Items, int TotalCount)> GetByUserIdAsync(long userId, long tenantId, SaaS.Application.DTOs.Requests.WorkReportQueryRequestDto request);
    Task<bool> HasSubmittedReportAsync(long userId, long tenantId, DateTime date);
    Task<(IEnumerable<WorkReport> Items, int TotalCount)> GetTeamReportsAsync(long managerUserId, long tenantId, SaaS.Application.DTOs.Requests.WorkReportQueryRequestDto request);
    Task AddAsync(WorkReport workReport);
    Task AddRangeAsync(IEnumerable<WorkReport> workReports);
    Task UpdateAsync(WorkReport workReport);

    // Work Types
    Task<WorkType?> GetWorkTypeByIdAsync(int id, long tenantId);
    Task<WorkType?> GetWorkTypeByNameAsync(string name, long tenantId);
    Task<IEnumerable<WorkType>> GetAllActiveWorkTypesAsync(long tenantId);
    Task<IEnumerable<WorkType>> GetAllWorkTypesAsync(long tenantId);
    Task AddWorkTypeAsync(WorkType workType);
    Task UpdateWorkTypeAsync(WorkType workType);
}

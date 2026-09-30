using Microsoft.EntityFrameworkCore;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Repository;
using SaaS.Domain.Enums;
using SaaS.Infrastructure.Data;

namespace SaaS.Infrastructure.Repositories;


public class SuperAdminDashboardRepository : ISuperAdminDashboardRepository
{
    private readonly AppDbContext _context;

    public SuperAdminDashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SuperAdminDashboardDto> GetDashboardDataAsync()
    {
        var totalTenants = await _context.Tenants.CountAsync();
        var totalPlans = await _context.Plans.CountAsync();
        var totalFeatures = await _context.Features.CountAsync();
        var totalUsers = await _context.Users.CountAsync();
        
        var activeSubscriptions = await _context.Subscriptions
            .CountAsync(s => s.Status == SubscriptionStatus.Active);
            
        var totalRevenueDec = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Succeeded)
            .SumAsync(p => p.Amount);
            
        var supportTickets = await _context.Tickets.CountAsync();
        
        var popularPlanEntity = await _context.Subscriptions
            .Include(s => s.Plan)
            .GroupBy(s => new { s.PlanId, s.Plan.Name })
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key.Name)
            .FirstOrDefaultAsync();
        var popularPlan = popularPlanEntity ?? "N/A";
        
        var recentTenantsCount = await _context.Tenants
            .CountAsync(t => t.CreatedAt > DateTime.UtcNow.AddDays(-31));
        var recentTenantsAdded = $"+{recentTenantsCount}";
        var recentPayments = await _context.Payments
            .CountAsync(p => p.Status == PaymentStatus.Succeeded && p.PaymentDate > DateTime.UtcNow.AddDays(-30));

        var recentTenants = await _context.Tenants
            .Include(t => t.Subscriptions)
                .ThenInclude(s => s.Plan)
            .OrderByDescending(t => t.CreatedAt)
            .Take(4)
            .Select(t => new SuperAdminDashboardTenantDto
            {
                Id = "tnt_" + t.Id.ToString(),
                Name = t.CompanyName,
                PlanName = t.Subscriptions.OrderByDescending(s => s.CreatedAt).FirstOrDefault() != null 
                    ? t.Subscriptions.OrderByDescending(s => s.CreatedAt).First().Plan.Name 
                    : "No Plan",
                Status = t.Status == TenantStatus.Active ? "Active" : "Inactive",
                Mrr = t.Subscriptions.OrderByDescending(s => s.CreatedAt).FirstOrDefault() != null
                    ? (int)t.Subscriptions.OrderByDescending(s => s.CreatedAt).First().Plan.MonthlyPrice
                    : 0
            })
            .ToListAsync();

        var activePlans = await _context.Plans
            .Select(p => new SuperAdminDashboardPlanDto
            {
                Id = "plan_" + p.Id.ToString(),
                Name = p.Name,
                BillingCycle = "Monthly/Yearly",
                ActiveTenantsCount = _context.Subscriptions.Count(s => s.PlanId == p.Id && s.Status == SubscriptionStatus.Active),
                Price = (int)p.MonthlyPrice
            })
            .ToListAsync();

        return new SuperAdminDashboardDto
        {
            Metrics = new SuperAdminDashboardMetricsDto
            {
                TotalRevenue = new MetricDto { Value = $"₹{totalRevenueDec:N0}" },
                TotalTenants = new MetricDto { Value = totalTenants },
                ActiveSubscriptions = new MetricDto { Value = activeSubscriptions },
                TotalPlans = new MetricDto { Value = totalPlans },
                TotalFeatures = new MetricDto { Value = totalFeatures },
                PopularPlan = new MetricDto { Value = popularPlan },
                SupportTickets = new MetricDto { Value = supportTickets },
                RecentTenantsAdded = new MetricDto { Value = recentTenantsAdded },
                RecentPayments = new MetricDto { Value = recentPayments },
                TotalUsers = new MetricDto { Value = totalUsers > 1000 ? (totalUsers / 1000.0).ToString("0.0") + "K" : totalUsers.ToString() }
            },
            RecentTenants = recentTenants,
            ActivePlans = activePlans
        };
    }
}

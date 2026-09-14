using Microsoft.EntityFrameworkCore;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedSuperAdminAsync(AppDbContext context)
    {
        bool superAdminExists = await context.Users.AnyAsync(u => u.Role == Role.SuperAdmin);
        if (superAdminExists) return;

        var superAdmin = new User
        {
            TenantId = null,
            FirstName = "super",
            LastName = "admin",
            Email = "superadmin@teamo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test1234@!"),
            Role = Role.SuperAdmin
        };

        await context.Users.AddAsync(superAdmin);
        await context.SaveChangesAsync();
    }

    public static async Task SeedMockTenantAsync(AppDbContext context)
    {
        bool mockTenantExists = await context.Tenants.AnyAsync(t => t.CompanyName == "Mock Tenant");
        if (mockTenantExists) return;

        // 1. Create a dummy Plan if it doesn't exist
        var plan = await context.Plans.FirstOrDefaultAsync();
        if (plan == null)
        {
            plan = new Plan
            {
                Name = "Mock Plan",
                Code = "MOCK-001",
                Description = "A mock plan for testing",
                MonthlyPrice = 999,
                YearlyPrice = 9999,
                Currency = PlanCurrency.INR,
                Version = 1,
                EffectiveFrom = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                Status = PlanStatus.Active
            };
            await context.Plans.AddAsync(plan);
            await context.SaveChangesAsync();
        }

        // 2. Create the Mock Tenant
        var tenant = new Tenant
        {
            CompanyName = "Mock Tenant",
            CIN = "U12345MH2023PTC123456",
            Address = "123 Mock Street",
            Pincode = "400001",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await context.Tenants.AddAsync(tenant);
        await context.SaveChangesAsync();

        // 3. Create a User for the Mock Tenant
        var user = new User
        {
            TenantId = tenant.Id,
            FirstName = "Mock",
            LastName = "User",
            Email = "mock@tenant.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test1234@"),
            Role = Role.TenantAdmin
        };
        await context.Users.AddAsync(user);

        // 4. Create an Active Subscription for the Mock Tenant
        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            PlanId = plan.Id,
            BillingCycle = BillingCycle.Monthly,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            Status = SubscriptionStatus.Active,
            OrganizationName = "Mock Tenant",
            Address = "123 Mock Street",
            City = "Mumbai",
            State = "Maharashtra",
            Pincode = "400001",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await context.Subscriptions.AddAsync(subscription);
        await context.SaveChangesAsync();
    }
}
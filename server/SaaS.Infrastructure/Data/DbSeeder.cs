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
            Email = "superadmin@teamc.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test1234@!"),
            Role = Role.SuperAdmin
        };

        await context.Users.AddAsync(superAdmin);
        await context.SaveChangesAsync();
    }
}
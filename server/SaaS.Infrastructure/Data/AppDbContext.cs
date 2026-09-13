using Microsoft.EntityFrameworkCore;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<PlanFeature> PlanFeatures => Set<PlanFeature>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration classes in Infrastructure assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);



        // ---- Tenant → Users (one-to-many, nullable FK for SuperAdmin) ----
        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(u => u.TenantId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);



        // ---- User email must be unique ----
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // ---- Feature code must be unique ----
        modelBuilder.Entity<Feature>()
            .HasIndex(f => f.Code)
            .IsUnique();

        // ---- Decimal precision for money fields ----
        modelBuilder.Entity<Plan>()
            .Property(p => p.MonthlyPrice)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Plan>()
            .Property(p => p.YearlyPrice)
            .HasPrecision(10, 2);
    }
}
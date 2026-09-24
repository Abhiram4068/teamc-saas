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
    public DbSet<PlanFeatureConfig> PlanFeatureConfigs => Set<PlanFeatureConfig>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Designation> Designations => Set<Designation>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<EmployeeLeaveBalance> EmployeeLeaveBalances => Set<EmployeeLeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<Document> Documents => Set<Document>();
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

        // ---- Department & Designation ----
        modelBuilder.Entity<Department>()
            .HasMany(d => d.Designations)
            .WithOne(d => d.Department)
            .HasForeignKey(d => d.DepartmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Department>()
            .HasMany(d => d.Employees)
            .WithOne(e => e.Department)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Designation>()
            .HasMany(d => d.Employees)
            .WithOne(e => e.Designation)
            .HasForeignKey(e => e.DesignationId)
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

        // ---- Leaves ----
        modelBuilder.Entity<EmployeeLeaveBalance>()
            .Property(e => e.TotalDays)
            .HasPrecision(5, 2);

        modelBuilder.Entity<EmployeeLeaveBalance>()
            .Property(e => e.UsedDays)
            .HasPrecision(5, 2);

        modelBuilder.Entity<LeaveRequest>()
            .Property(l => l.NumberOfDays)
            .HasPrecision(5, 2);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.Employee)
            .WithMany()
            .HasForeignKey(lr => lr.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.Manager)
            .WithMany()
            .HasForeignKey(lr => lr.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EmployeeLeaveBalance>()
            .HasOne(elb => elb.Employee)
            .WithMany()
            .HasForeignKey(elb => elb.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EmployeeLeaveBalance>()
            .HasOne(elb => elb.Tenant)
            .WithMany()
            .HasForeignKey(elb => elb.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.Tenant)
            .WithMany()
            .HasForeignKey(lr => lr.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveType>()
            .HasOne(lt => lt.Tenant)
            .WithMany()
            .HasForeignKey(lt => lt.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // ---- Documents ----
        modelBuilder.Entity<Document>()
            .HasOne(d => d.Tenant)
            .WithMany()
            .HasForeignKey(d => d.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Document>()
            .HasOne(d => d.User)
            .WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
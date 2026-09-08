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
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---- PlanFeature: composite key for the many-to-many join ----
        modelBuilder.Entity<PlanFeature>()
            .HasKey(pf => new { pf.PlanId, pf.FeatureId });

        modelBuilder.Entity<PlanFeature>()
            .HasOne(pf => pf.Plan)
            .WithMany(p => p.PlanFeatures)
            .HasForeignKey(pf => pf.PlanId);

        modelBuilder.Entity<PlanFeature>()
            .HasOne(pf => pf.Feature)
            .WithMany(f => f.PlanFeatures)
            .HasForeignKey(pf => pf.FeatureId);

        // ---- Tenant → Users (one-to-many, nullable FK for SuperAdmin) ----
        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(u => u.TenantId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // ---- Tenant → Subscriptions ----
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Tenant)
            .WithMany(t => t.Subscriptions)
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // ---- Plan → Subscriptions ----
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Plan)
            .WithMany(p => p.Subscriptions)
            .HasForeignKey(s => s.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        // ---- Subscription → Payments ----
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Subscription)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);

        // ---- Payment idempotency: ProviderEventId must be unique when present ----
        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.ProviderEventId)
            .IsUnique()
            .HasFilter("[ProviderEventId] IS NOT NULL");

        // ---- Tenant slug must be unique ----
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        // ---- User email must be unique ----
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // ---- Feature code must be unique ----
        modelBuilder.Entity<Feature>()
            .HasIndex(f => f.Code)
            .IsUnique();

        // ---- Subscription optimistic concurrency ----
        modelBuilder.Entity<Subscription>()
            .Property(s => s.RowVersion)
            .IsRowVersion();

        // ---- Decimal precision for money fields ----
        modelBuilder.Entity<Plan>()
            .Property(p => p.Price)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(10, 2);
    }
}
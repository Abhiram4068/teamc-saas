using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employee");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.UserId)
            .IsRequired();

        // One User can have only one Employee profile.
        builder.HasIndex(e => e.UserId)
            .IsUnique();

        builder.Property(e => e.TenantId)
            .IsRequired();

        // Critical for tenant-scoped queries.
        builder.HasIndex(e => e.TenantId);

        builder.Property(e => e.Designation)
            .HasMaxLength(150)
            .IsRequired(false);

        builder.Property(e => e.Department)
            .HasMaxLength(150)
            .IsRequired(false);

        builder.Property(e => e.JoiningDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(e => e.ReportingManagerId)
            .IsRequired(false);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired(false);

        // Employee → Tenant
        builder.HasOne(e => e.Tenant)
            .WithMany(t => t.Employees)
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Employee → Reporting Manager
        builder.HasOne(e => e.ReportingManager)
            .WithMany(e => e.DirectReports)
            .HasForeignKey(e => e.ReportingManagerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
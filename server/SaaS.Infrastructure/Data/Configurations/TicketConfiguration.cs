using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Data.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Subject).IsRequired().HasMaxLength(255);
        builder.Property(t => t.Description).IsRequired();
        builder.Property(t => t.Category).IsRequired().HasMaxLength(100);
        
        builder.Property(t => t.RaisedByEmail).IsRequired().HasMaxLength(255);
        builder.Property(t => t.AssignedToEmail).IsRequired().HasMaxLength(255);
        
        builder.Property(t => t.Status)
            .IsRequired()
            .HasDefaultValue(TicketStatus.Open);
            
        builder.Property(t => t.Priority)
            .IsRequired()
            .HasDefaultValue(TicketPriority.Medium);

        builder.HasMany(t => t.Replies)
            .WithOne(r => r.Ticket)
            .HasForeignKey(r => r.TicketId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

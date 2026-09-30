using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SaaS.Domain.Entities;

namespace SaaS.Infrastructure.Data.Configurations;

public class TicketReplyConfiguration : IEntityTypeConfiguration<TicketReply>
{
    public void Configure(EntityTypeBuilder<TicketReply> builder)
    {
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Message).IsRequired();
        builder.Property(r => r.ReplyByEmail).IsRequired().HasMaxLength(255);
    }
}

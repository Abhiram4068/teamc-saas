using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Response;

public class PaymentResponseDto
{
    public Guid Id { get; set; }
    public long TenantId { get; set; }
    public Guid SubscriptionId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string StripeInvoiceId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

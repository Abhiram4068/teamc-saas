namespace SaaS.Domain.Enums;

public enum PaymentStatus
{
    Pending = 1,
    Succeeded = 2,
    Failed = 3,
    Refunded = 4,
    PartiallyRefunded = 5,
    RefundPending = 6,
    RefundFailed = 7
}
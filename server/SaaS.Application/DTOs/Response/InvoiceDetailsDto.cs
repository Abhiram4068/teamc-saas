namespace SaaS.Application.DTOs.Response;

public class InvoiceDetailsDto
{
    public Guid PaymentId { get; set; }
    public string StripeInvoiceId { get; set; } = string.Empty;
    public DateTime? PaymentDate { get; set; }
    public decimal Amount { get; set; }
    
    // Tenant Details
    public string TenantName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserPhone { get; set; } = string.Empty;

    // Subscription/Plan Details
    public string PlanName { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public string Currency { get; set; } = string.Empty;
}

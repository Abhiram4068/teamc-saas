namespace SaaS.Application.DTOs.Response;

public class InvoiceResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string InvoicePdfUrl { get; set; } = string.Empty;
    public string HostedInvoiceUrl { get; set; } = string.Empty;
}

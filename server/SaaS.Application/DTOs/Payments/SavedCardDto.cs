namespace SaaS.Application.DTOs.Payements;

public class SavedCardDto
{
    public string PaymentMethodId { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public long ExpMonth { get; set; }
    public long ExpYear { get; set; }
}

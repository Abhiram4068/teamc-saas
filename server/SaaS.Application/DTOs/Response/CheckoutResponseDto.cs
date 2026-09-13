namespace SaaS.Application.DTOs.Response;

public class CheckoutResponseDto
{
    public string SessionId { get; set; } = string.Empty;

    public string CheckoutUrl { get; set; } = string.Empty;
}
namespace SaaS.Application.Interfaces.Payments;

/// <summary>
/// Interface for automating the stripemonthly and yearly price ids in stripe dashboard
/// </summary>
public interface IStripeProductService
{
    Task<(string MonthlyPriceId, string YearlyPriceId)> CreateStripeProductAndPricesAsync(
        string planName,
        decimal monthlyPrice,
        decimal yearlyPrice,
        string currency);
}

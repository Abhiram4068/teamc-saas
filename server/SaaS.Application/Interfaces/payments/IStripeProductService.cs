namespace SaaS.Application.Interfaces.Payments;

public interface IStripeProductService
{
    Task<(string MonthlyPriceId, string YearlyPriceId)> CreateStripeProductAndPricesAsync(
        string planName,
        decimal monthlyPrice,
        decimal yearlyPrice,
        string currency);
}

using Stripe;
using SaaS.Application.Interfaces.Payments;
using Microsoft.Extensions.Logging;

namespace SaaS.Infrastructure.Payments.Stripe;

public class StripeProductService : IStripeProductService
{
    private readonly ILogger<StripeProductService> _logger;

    public StripeProductService(ILogger<StripeProductService> logger)
    {
        _logger = logger;
    }

    public async Task<(string MonthlyPriceId, string YearlyPriceId)> CreateStripeProductAndPricesAsync(
        string planName,
        decimal monthlyPrice,
        decimal yearlyPrice,
        string currency)
    {
        _logger.LogInformation("Creating Stripe Product for Plan: {PlanName}", planName);

        // 1. Create the Product
        var productOptions = new ProductCreateOptions
        {
            Name = planName,
        };
        var productService = new ProductService();
        var product = await productService.CreateAsync(productOptions);

        _logger.LogInformation("Created Stripe Product ID: {ProductId}", product.Id);

        // 2. Create the Prices (Stripe expects amount in cents/paise)
        var priceService = new PriceService();

        var monthlyPriceOptions = new PriceCreateOptions
        {
            Product = product.Id,
            UnitAmountDecimal = monthlyPrice * 100, // Convert to smallest currency unit
            Currency = currency.ToLowerInvariant(),
            Recurring = new PriceRecurringOptions
            {
                Interval = "month",
            },
        };
        var monthlyStripePrice = await priceService.CreateAsync(monthlyPriceOptions);

        var yearlyPriceOptions = new PriceCreateOptions
        {
            Product = product.Id,
            UnitAmountDecimal = yearlyPrice * 100, // Convert to smallest currency unit
            Currency = currency.ToLowerInvariant(),
            Recurring = new PriceRecurringOptions
            {
                Interval = "year",
            },
        };
        var yearlyStripePrice = await priceService.CreateAsync(yearlyPriceOptions);

        _logger.LogInformation("Created Stripe Prices. Monthly: {MonthlyPriceId}, Yearly: {YearlyPriceId}", 
            monthlyStripePrice.Id, yearlyStripePrice.Id);

        return (monthlyStripePrice.Id, yearlyStripePrice.Id);
    }
}

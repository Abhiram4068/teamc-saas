using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SaaS.Domain.Enums;
using SaaS.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SaaS.API.BackgroundServices;

public class SubscriptionTransitionJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionTransitionJob> _logger;
    private readonly int _intervalMinutes;

    public SubscriptionTransitionJob(
        IServiceScopeFactory scopeFactory,
        ILogger<SubscriptionTransitionJob> logger,
        IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _intervalMinutes = configuration.GetValue<int?>("SubscriptionTransitionJob:IntervalMinutes") ?? 5;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SubscriptionTransitionJob starting with {Interval} minute interval.", _intervalMinutes);

        // Run one cycle immediately
        await RunCycleAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(_intervalMinutes));
        
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunCycleAsync(stoppingToken);
        }
        
        _logger.LogInformation("SubscriptionTransitionJob stopping.");
    }

    private async Task RunCycleAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = DateTime.UtcNow;

            var activeToDeactivate = await dbContext.Subscriptions
                .Where(s => s.Status == SubscriptionStatus.Active && s.EndDate != null && s.EndDate <= now)
                .ToListAsync(stoppingToken);

            var scheduledToActivate = await dbContext.Subscriptions
                .Where(s => s.Status == SubscriptionStatus.Scheduled && s.StartDate <= now)
                .ToListAsync(stoppingToken);

            if (activeToDeactivate.Count == 0 && scheduledToActivate.Count == 0)
            {
                return;
            }

            foreach (var sub in activeToDeactivate)
            {
                sub.Status = SubscriptionStatus.Expired;
                sub.UpdatedAt = now;
            }

            foreach (var sub in scheduledToActivate)
            {
                sub.Status = SubscriptionStatus.Active;
                sub.UpdatedAt = now;
            }

            await dbContext.SaveChangesAsync(stoppingToken);

            _logger.LogInformation("SubscriptionTransitionJob: Expired {DeactivatedCount}, Activated {ActivatedCount}.", 
                activeToDeactivate.Count, 
                scheduledToActivate.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while running the SubscriptionTransitionJob cycle.");
        }
    }
}

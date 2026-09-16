using Microsoft.AspNetCore.Authorization;
using SaaS.Application.Interfaces.Features;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace SaaS.Api.Policies.Features;

public class FeatureAuthorizationHandler : AuthorizationHandler<FeatureRequirement>
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FeatureAuthorizationHandler(IServiceProvider serviceProvider, IHttpContextAccessor httpContextAccessor)
    {
        _serviceProvider = serviceProvider;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, FeatureRequirement requirement)
    {
        var tenantIdString = context.User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdString) || !int.TryParse(tenantIdString, out var tenantId))
        {
            context.Fail();
            return;
        }

        // Use a scoped service for DB operations since AuthorizationHandler is usually registered as singleton/scoped differently
        using var scope = _serviceProvider.CreateScope();
        var featureService = scope.ServiceProvider.GetRequiredService<ITenantFeatureService>();

        var hasFeature = await featureService.HasFeatureAsync(tenantId, requirement.FeatureCode);

        if (hasFeature)
        {
            context.Succeed(requirement);
        }
        else
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && !httpContext.Response.HasStarted)
            {
                httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
                httpContext.Response.ContentType = "application/json";
                await httpContext.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = $"You do not have access to this feature. Please upgrade your subscription plan."
                });
                await httpContext.Response.CompleteAsync();
            }
            context.Fail();
        }
    }
}

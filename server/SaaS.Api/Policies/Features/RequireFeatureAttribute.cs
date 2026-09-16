using Microsoft.AspNetCore.Authorization;

namespace SaaS.Api.Policies.Features;

public class RequireFeatureAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "Feature:";

    public RequireFeatureAttribute(string featureCode)
    {
        Policy = $"{PolicyPrefix}{featureCode}";
    }
}

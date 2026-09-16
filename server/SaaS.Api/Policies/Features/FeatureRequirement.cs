using Microsoft.AspNetCore.Authorization;

namespace SaaS.Api.Policies.Features;

public class FeatureRequirement : IAuthorizationRequirement
{
    public string FeatureCode { get; }

    public FeatureRequirement(string featureCode)
    {
        FeatureCode = featureCode;
    }
}

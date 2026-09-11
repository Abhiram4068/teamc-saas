using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Requests;
using SaaS.Application.DTOs.Response;
using SaaS.Application.Interfaces.Service;
using SaaS.Domain.Enums;

namespace SaaS.Api.Controllers;

/// <summary>
/// Controller for managing system features (Restricted to SuperAdmin - Role = 1).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "1")]
public class FeaturesController : ControllerBase
{
    private readonly IFeatureService _featureService;
    private readonly ILogger<FeaturesController> _logger;

    public FeaturesController(IFeatureService featureService, ILogger<FeaturesController> logger)
    {
        _featureService = featureService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new system feature capability. SuperAdmin (Role = 1) required.
    /// </summary>
    /// <param name="request">The feature payload request DTO.</param>
    /// <returns>An <see cref="IActionResult"/> containing the API response with created feature.</returns>
    [HttpPost]
    public async Task<IActionResult> CreateFeature([FromBody] CreateFeatureRequestDto request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdStr))
        {
            return Unauthorized();
        }

        var createdBy = User.FindFirst(ClaimTypes.Email)?.Value ?? userIdStr;

        _logger.LogInformation("Create feature request received for Code: {Code} by User: {CreatedBy}.", request.Code, createdBy);

        var response = await _featureService.CreateFeatureAsync(request, createdBy);

        return StatusCode(response.StatusCode, response);
    }

    /// <summary>
    /// Retrieves a specific system feature by ID. SuperAdmin (Role = 1) required.
    /// </summary>
    /// <param name="id">The ID of the feature.</param>
    /// <returns>An <see cref="IActionResult"/> containing the feature details.</returns>
    [HttpGet("{id}")]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> GetFeatureById(int id)
    {
        _logger.LogInformation("Get feature by ID {FeatureId} request received.", id);

        var response = await _featureService.GetFeatureByIdAsync(id);

        return StatusCode(response.StatusCode, response);
    }

    /// <summary>
    /// Retrieves a paginated list of system features with optional filtering. SuperAdmin (Role = 1) required.
    /// </summary>
    /// <param name="request">The parameters for pagination and filtering.</param>
    /// <returns>An <see cref="IActionResult"/> containing the paginated list of features.</returns>
    [HttpGet]
    [Authorize(Roles = "1")]
    public async Task<IActionResult> GetFeatures([FromQuery] GetFeaturesRequestDto request)
    {
        _logger.LogInformation("Get features request received.");

        var response = await _featureService.GetFeaturesAsync(request);

        return StatusCode(response.StatusCode, response);
    }
}

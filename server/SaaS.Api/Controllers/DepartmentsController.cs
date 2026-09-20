using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces.Service;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departments = await _departmentService.GetAllDepartmentsAsync();
        return Ok(new { success = true, data = departments });
    }

    [HttpGet("{id}/designations")]
    public async Task<IActionResult> GetDesignations(int id)
    {
        var designations = await _departmentService.GetDesignationsByDepartmentIdAsync(id);
        return Ok(new { success = true, data = designations });
    }
}

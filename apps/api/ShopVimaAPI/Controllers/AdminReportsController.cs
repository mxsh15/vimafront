using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Reports;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize]
public class AdminReportsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminReportsController(ShopDbContext db) => _db = db;


    [HttpGet("overview")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<ReportsOverviewDto>> Overview()
    {
        var now = DateTime.UtcNow;
        var from24h = now.AddHours(-24);
        var from7d = now.AddDays(-7);

        var q24 = _db.AuditLogs.AsNoTracking().Where(x => x.CreatedAtUtc >= from24h && !x.IsDeleted);
        var q7 = _db.AuditLogs.AsNoTracking().Where(x => x.CreatedAtUtc >= from7d && !x.IsDeleted);

        var actions24 = await q24.CountAsync();
        var actions7 = await q7.CountAsync();

        var errors24 = await q24.CountAsync(x => x.StatusCode >= 400);
        var errors7 = await q7.CountAsync(x => x.StatusCode >= 400);

        var topPaths = await q24
            .GroupBy(x => x.Path)
            .OrderByDescending(g => g.Count())
            .Take(8)
            .Select(g => new TopRowDto(g.Key, g.Count()))
            .ToListAsync();

        var topUsers = await q24
            .Where(x => x.UserEmail != null)
            .GroupBy(x => x.UserEmail!)
            .OrderByDescending(g => g.Count())
            .Take(8)
            .Select(g => new TopRowDto(g.Key, g.Count()))
            .ToListAsync();

        return Ok(new ReportsOverviewDto(actions24, actions7, errors24, errors7, topPaths, topUsers));
    }
}
